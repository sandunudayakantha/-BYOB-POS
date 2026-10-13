const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/responseHandler');
const Branch = require('../models/Branch');
const Restaurant = require('../models/Restaurant');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get All Branches for Logged-In Restaurant
// @route   GET /api/branches
// @access  Private (Owner / Super Admin)
const getBranches = asyncHandler(async (req, res) => {
  const restaurantId = req.user.role === 'SUPER_ADMIN' ? req.query.restaurantId : req.restaurantId;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: 'Restaurant ID is required.' });
  }

  const branches = await Branch.find({ restaurant: restaurantId }).sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Branches fetched successfully', branches);
});

// @desc    Create New Branch (Checking maxBranches Limit)
// @route   POST /api/branches
// @access  Private (Owner)
const createBranch = asyncHandler(async (req, res) => {
  const { name, address, phone, isMain } = req.body;
  const restaurantId = req.restaurantId;

  if (!name || !address || !phone) {
    return res.status(400).json({ success: false, message: 'Please provide branch name, address, and phone.' });
  }

  // 1. Check current branch count vs maxBranches limit
  const restaurant = await Restaurant.findById(restaurantId);
  const currentBranchCount = await Branch.countDocuments({ restaurant: restaurantId });

  if (currentBranchCount >= restaurant.maxBranches) {
    return res.status(400).json({
      success: false,
      message: `Branch limit reached! Your subscription allows a maximum of ${restaurant.maxBranches} branches.`
    });
  }

  let logoUrl = req.body.logo || '';
  let coverUrl = req.body.coverImage || '';

  if (req.files?.logo) {
    const uploadedLogo = await uploadToCloudinary(req.files.logo[0].buffer, 'branches/logos');
    logoUrl = uploadedLogo.secure_url;
  }

  if (req.files?.coverImage) {
    const uploadedCover = await uploadToCloudinary(req.files.coverImage[0].buffer, 'branches/covers');
    coverUrl = uploadedCover.secure_url;
  }

  const branch = new Branch({
    restaurant: restaurantId,
    name,
    address,
    phone,
    logo: logoUrl,
    coverImage: coverUrl,
    isMain: isMain === 'true' || isMain === true
  });

  await branch.save();
  return sendResponse(res, 201, 'Branch created successfully', branch);
});

// @desc    Update Branch
// @route   PUT /api/branches/:id
// @access  Private (Owner)
const updateBranch = asyncHandler(async (req, res) => {
  const { name, address, phone, status, isMain, logo, coverImage } = req.body;

  const branch = await Branch.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!branch) {
    return res.status(404).json({ success: false, message: 'Branch not found or access denied.' });
  }

  if (name) branch.name = name;
  if (address) branch.address = address;
  if (phone) branch.phone = phone;
  if (status) branch.status = status;
  if (isMain !== undefined) branch.isMain = isMain === 'true' || isMain === true;
  if (logo !== undefined) branch.logo = logo;
  if (coverImage !== undefined) branch.coverImage = coverImage;

  if (req.files?.logo) {
    const uploadedLogo = await uploadToCloudinary(req.files.logo[0].buffer, 'branches/logos');
    branch.logo = uploadedLogo.secure_url;
  }

  if (req.files?.coverImage) {
    const uploadedCover = await uploadToCloudinary(req.files.coverImage[0].buffer, 'branches/covers');
    branch.coverImage = uploadedCover.secure_url;
  }

  await branch.save();
  return sendResponse(res, 200, 'Branch updated successfully', branch);
});

const Category = require('../models/Category');
const Product = require('../models/Product');
const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const FeaturedSection = require('../models/FeaturedSection');

// @desc    Delete Branch
// @route   DELETE /api/branches/:id
// @access  Private (Owner)
const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!branch) {
    return res.status(404).json({ success: false, message: 'Branch not found or access denied.' });
  }

  if (branch.isMain) {
    return res.status(400).json({ success: false, message: 'Cannot delete the Main Branch.' });
  }

  await Branch.findByIdAndDelete(branch._id);
  return sendResponse(res, 200, 'Branch deleted successfully.');
});

// @desc    Import / Clone Catalog (Categories, Products, Menus, Featured) from Source Branch to Target Branch
// @route   POST /api/branches/import
// @access  Private (Owner)
const importBranchCatalog = asyncHandler(async (req, res) => {
  const {
    sourceBranchId,
    targetBranchId,
    includeCategoriesAndProducts = true,
    includeMenus = true,
    includeFeatured = true
  } = req.body;

  if (!sourceBranchId || !targetBranchId) {
    return res.status(400).json({ success: false, message: 'Source branch and target branch are required.' });
  }

  if (sourceBranchId === targetBranchId) {
    return res.status(400).json({ success: false, message: 'Source branch and target branch must be different.' });
  }

  // Verify ownership of both branches
  const sourceBranch = await Branch.findOne({ _id: sourceBranchId, restaurant: req.restaurantId });
  const targetBranch = await Branch.findOne({ _id: targetBranchId, restaurant: req.restaurantId });

  if (!sourceBranch || !targetBranch) {
    return res.status(404).json({ success: false, message: 'Source or target branch not found or access denied.' });
  }

  const categoryIdMap = new Map(); // Old Category ID -> New Category ID
  const productIdMap = new Map();  // Old Product ID -> New Product ID
  const menuIdMap = new Map();     // Old Menu ID -> New Menu ID

  let clonedCategoryCount = 0;
  let clonedProductCount = 0;
  let clonedMenuCount = 0;
  let clonedMenuItemCount = 0;
  let clonedFeaturedCount = 0;

  // 1. Clone Categories & Products
  if (includeCategoriesAndProducts) {
    const sourceCategories = await Category.find({ restaurant: req.restaurantId, branch: sourceBranchId });
    
    for (const cat of sourceCategories) {
      const newCat = new Category({
        restaurant: req.restaurantId,
        branch: targetBranchId,
        name: cat.name,
        description: cat.description || '',
        icon: cat.icon || '',
        status: cat.status || 'ACTIVE',
        sortOrder: cat.sortOrder || 0
      });
      await newCat.save();
      categoryIdMap.set(cat._id.toString(), newCat._id);
      clonedCategoryCount++;
    }

    const sourceProducts = await Product.find({ restaurant: req.restaurantId, branch: sourceBranchId });

    for (const prod of sourceProducts) {
      const newCatId = prod.category ? categoryIdMap.get(prod.category.toString()) : null;
      const newProd = new Product({
        restaurant: req.restaurantId,
        branch: targetBranchId,
        category: newCatId || null,
        name: prod.name,
        description: prod.description || '',
        prepTime: prod.prepTime || '15-20 mins',
        image: prod.image || '',
        featuredImage: prod.featuredImage || '',
        available: prod.available
      });
      await newProd.save();
      productIdMap.set(prod._id.toString(), newProd._id);
      clonedProductCount++;
    }
  }

  // 2. Clone Menus & MenuItems
  if (includeMenus) {
    const sourceMenus = await Menu.find({ restaurant: req.restaurantId, branch: sourceBranchId });

    for (const menu of sourceMenus) {
      const newMenu = new Menu({
        restaurant: req.restaurantId,
        branch: targetBranchId,
        name: menu.name,
        description: menu.description || '',
        status: menu.status || 'ACTIVE'
      });
      await newMenu.save();
      menuIdMap.set(menu._id.toString(), newMenu._id);
      clonedMenuCount++;

      // Clone MenuItems belonging to this menu
      const sourceItems = await MenuItem.find({ menu: menu._id });
      for (const item of sourceItems) {
        const newProdId = item.product ? productIdMap.get(item.product.toString()) : null;
        let finalProdId = newProdId;

        // If products weren't cloned in this pass, try finding product by name in target branch
        if (!finalProdId && item.product) {
          const origProd = await Product.findById(item.product);
          if (origProd) {
            const existingTargetProd = await Product.findOne({
              restaurant: req.restaurantId,
              branch: targetBranchId,
              name: origProd.name
            });
            if (existingTargetProd) finalProdId = existingTargetProd._id;
          }
        }

        if (finalProdId) {
          const newItem = new MenuItem({
            menu: newMenu._id,
            product: finalProdId,
            price: item.price,
            available: item.available,
            sortOrder: item.sortOrder || 0
          });
          await newItem.save();
          clonedMenuItemCount++;
        }
      }
    }
  }

  // 3. Clone Featured Sections
  if (includeFeatured) {
    const sourceFeatured = await FeaturedSection.find({ restaurant: req.restaurantId, branch: sourceBranchId });

    for (const sec of sourceFeatured) {
      const targetProductIds = (sec.products || [])
        .map((pId) => productIdMap.get(pId.toString()))
        .filter(Boolean);

      const newSec = new FeaturedSection({
        restaurant: req.restaurantId,
        branch: targetBranchId,
        title: sec.title,
        description: sec.description || '',
        products: targetProductIds,
        startDate: sec.startDate || null,
        endDate: sec.endDate || null,
        isActive: sec.isActive
      });
      await newSec.save();
      clonedFeaturedCount++;
    }
  }

  return sendResponse(res, 200, 'Catalog imported successfully from source branch', {
    sourceBranch: sourceBranch.name,
    targetBranch: targetBranch.name,
    stats: {
      categories: clonedCategoryCount,
      products: clonedProductCount,
      menus: clonedMenuCount,
      menuItems: clonedMenuItemCount,
      featuredSections: clonedFeaturedCount
    }
  });
});

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  importBranchCatalog
};
