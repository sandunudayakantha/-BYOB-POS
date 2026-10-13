const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/responseHandler');
const QRCodeModel = require('../models/QRCode');
const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Product = require('../models/Product');
const FeaturedSection = require('../models/FeaturedSection');
const NodeCache = require('node-cache');

// In-memory cache for public menus (TTL: 60 seconds)
const publicMenuCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// --- Per-IP QR Token Brute-Force Protection ---
// Tracks failed token lookups in memory per IP address.
// After 10 failed attempts within 15 minutes, the IP is blocked.
const failedQRAttempts = new Map();
const QR_MAX_FAILURES = 10;
const QR_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const checkQRBruteForce = (ip) => {
  const now = Date.now();
  const record = failedQRAttempts.get(ip);
  if (record && now < record.resetAt && record.count >= QR_MAX_FAILURES) {
    return true; // blocked
  }
  return false;
};

const recordQRFailure = (ip) => {
  const now = Date.now();
  const record = failedQRAttempts.get(ip);
  if (!record || now >= record.resetAt) {
    failedQRAttempts.set(ip, { count: 1, resetAt: now + QR_WINDOW_MS });
  } else {
    failedQRAttempts.set(ip, { count: record.count + 1, resetAt: record.resetAt });
  }
};

const resetQRFailures = (ip) => {
  failedQRAttempts.delete(ip);
};
// -----------------------------------------------

// @desc    Get Public Customer Menu by QR Code Token (with Server-Side Infinite Scroll Pagination & Filtering)
// @route   GET /api/public/menu/:token
// @access  Public (Customer scanning QR)
const getPublicMenuByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { page = 1, limit = 12, categoryId, search } = req.query;
  const clientIp = req.ip;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(50, Number(limit)));

  // Block IP if too many failed QR token attempts
  if (checkQRBruteForce(clientIp)) {
    return res.status(429).json({
      success: false,
      message: 'Too many invalid QR code attempts. Please try again in 15 minutes.'
    });
  }

  // Check Cache First
  const cacheKey = `public_menu_${token}_${pageNum}_${limitNum}_${categoryId || 'ALL'}_${search || ''}`;
  const cachedResponse = publicMenuCache.get(cacheKey);
  
  if (cachedResponse) {
    // If cached, we still consider it a successful token scan, so reset failures
    resetQRFailures(clientIp);
    return sendResponse(res, 200, 'Public menu loaded successfully (Cached)', cachedResponse);
  }

  // 1. Find QR Code by Token
  const qrCode = await QRCodeModel.findOne({ token })
    .populate('restaurant', 'name logo coverImage status')
    .populate('branch', 'name address phone logo coverImage status')
    .populate('menu', 'name description status')
    .lean();

  if (!qrCode) {
    recordQRFailure(clientIp); // Track failed attempt
    return res.status(404).json({ success: false, message: 'Invalid or expired QR code.' });
  }

  // Valid token found — reset failure counter for this IP
  resetQRFailures(clientIp);

  if (!qrCode.isActive) {
    return res.status(403).json({ success: false, message: 'This QR code is currently inactive.' });
  }

  if (qrCode.restaurant.status === 'SUSPENDED') {
    return res.status(403).json({ success: false, message: 'This restaurant service is currently unavailable.' });
  }

  if (qrCode.branch.status !== 'ACTIVE') {
    return res.status(403).json({ success: false, message: 'This branch is currently closed or inactive.' });
  }

  if (qrCode.menu.status !== 'ACTIVE') {
    return res.status(403).json({ success: false, message: 'This menu is currently inactive.' });
  }

  const branchId = qrCode.branch._id;
  const menuId = qrCode.menu._id;
  const restaurantId = qrCode.restaurant._id;

  // 3. Server-Side Filter Products by Category & Search
  const productFilter = {
    restaurant: restaurantId,
    branch: branchId,
    available: true
  };

  if (categoryId && categoryId !== 'ALL') {
    productFilter.category = categoryId;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    productFilter.$or = [
      { name: searchRegex },
      { description: searchRegex }
    ];
  }

  // Parallelize Category fetching and Product filtering
  const [categories, matchingProducts] = await Promise.all([
    Category.find({
      restaurant: restaurantId,
      branch: branchId,
      status: 'ACTIVE'
    }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    Product.find(productFilter).select('_id').lean()
  ]);

  const matchingProductIds = matchingProducts.map(p => p._id);

  // 4. Server-Side Paginated Query for Menu Items
  const menuItemQuery = {
    menu: menuId,
    available: true,
    product: { $in: matchingProductIds }
  };

  // 5. Fetch Active Featured Sections (only on Page 1)
  const now = new Date();
  const featuredPromise = (pageNum === 1 && !search && (!categoryId || categoryId === 'ALL'))
    ? FeaturedSection.find({
        restaurant: restaurantId,
        branch: branchId,
        isActive: true,
        $and: [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
        ]
      }).populate({
        path: 'products',
        match: { available: true },
        populate: { path: 'category', select: 'name' }
      }).lean()
    : Promise.resolve([]);

  // Parallelize MenuItem count, MenuItem find, and FeaturedSection find
  const [totalMenuItems, menuItems, rawFeaturedSections] = await Promise.all([
    MenuItem.countDocuments(menuItemQuery),
    MenuItem.find(menuItemQuery)
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ sortOrder: 1, createdAt: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    featuredPromise
  ]);

  const validMenuItems = menuItems.filter(item => item.product !== null);

  let featuredSections = [];
  if (rawFeaturedSections.length > 0) {
    featuredSections = rawFeaturedSections.map(sec => ({
      _id: sec._id,
      title: sec.title,
      description: sec.description,
      products: sec.products.filter(p => p !== null)
    }));
  }

  const totalPages = Math.ceil(totalMenuItems / limitNum) || 1;

  const responseData = {
    tableName: qrCode.tableName || '',
    restaurant: {
      _id: qrCode.restaurant._id,
      name: qrCode.restaurant.name,
      logo: qrCode.restaurant.logo
    },
    branch: {
      _id: qrCode.branch._id,
      name: qrCode.branch.name,
      address: qrCode.branch.address,
      phone: qrCode.branch.phone,
      logo: qrCode.branch.logo,
      coverImage: qrCode.branch.coverImage
    },
    menu: {
      _id: qrCode.menu._id,
      name: qrCode.menu.name,
      description: qrCode.menu.description
    },
    categories,
    menuItems: validMenuItems.map(item => ({
      _id: item._id,
      price: item.price,
      available: item.available,
      sortOrder: item.sortOrder,
      product: item.product
    })),
    featuredSections,
    meta: {
      total: totalMenuItems,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasMore: pageNum < totalPages
    }
  };

  // Save to Cache
  publicMenuCache.set(cacheKey, responseData);

  return sendResponse(res, 200, 'Public menu loaded successfully', responseData);
});

module.exports = {
  getPublicMenuByToken
};
