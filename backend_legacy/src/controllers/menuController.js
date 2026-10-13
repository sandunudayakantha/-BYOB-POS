const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/responseHandler');
const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get Menus for a Branch
// @route   GET /api/menus
// @access  Private (Owner)
const getMenus = asyncHandler(async (req, res) => {
  const { branchId } = req.query;
  if (!branchId) {
    return res.status(400).json({ success: false, message: 'Branch ID is required.' });
  }

  const menus = await Menu.find({
    restaurant: req.restaurantId,
    branch: branchId
  }).sort({ createdAt: -1 });

  // Attach item count to each menu
  const menusWithCounts = await Promise.all(
    menus.map(async (m) => {
      const itemCount = await MenuItem.countDocuments({ menu: m._id });
      return {
        ...m.toObject(),
        itemCount
      };
    })
  );

  return sendResponse(res, 200, 'Menus fetched successfully', menusWithCounts);
});

// @desc    Get Cross-Menu Price Matrix & Comparison Report (Paginated for high scale)
// @route   GET /api/menus/price-matrix
// @access  Private (Owner)
const getPriceMatrix = asyncHandler(async (req, res) => {
  const { branchId, page = 1, limit = 10, search = '', categoryId = '' } = req.query;
  if (!branchId) {
    return res.status(400).json({ success: false, message: 'Branch ID is required.' });
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));

  const productQuery = {
    restaurant: req.restaurantId,
    branch: branchId
  };

  if (categoryId && categoryId !== 'ALL') {
    productQuery.category = categoryId;
  }

  if (search) {
    productQuery.name = { $regex: search, $options: 'i' };
  }

  const [menus, totalProducts, categories] = await Promise.all([
    Menu.find({ restaurant: req.restaurantId, branch: branchId }).sort({ createdAt: 1 }),
    Product.countDocuments(productQuery),
    Category.find({ restaurant: req.restaurantId, branch: branchId }).sort({ sortOrder: 1 })
  ]);

  const products = await Product.find(productQuery)
    .populate('category', 'name')
    .sort({ name: 1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const menuIds = menus.map(m => m._id);
  const productIds = products.map(p => p._id);

  // Fetch menu items only for the paginated products
  const menuItems = await MenuItem.find({
    menu: { $in: menuIds },
    product: { $in: productIds }
  });

  // Build matrix lookup map: matrix[productId][menuId] = { menuItemId, price, available }
  const matrix = {};
  menuItems.forEach(item => {
    const pId = item.product.toString();
    const mId = item.menu.toString();
    if (!matrix[pId]) matrix[pId] = {};
    matrix[pId][mId] = {
      menuItemId: item._id,
      price: item.price,
      available: item.available
    };
  });

  return sendResponse(res, 200, 'Price matrix report loaded successfully', {
    menus,
    products,
    categories,
    matrix
  }, {
    total: totalProducts,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalProducts / limitNum) || 1
  });
});

// @desc    Create Menu
// @route   POST /api/menus
// @access  Private (Owner)
const createMenu = asyncHandler(async (req, res) => {
  const { branchId, name, description, status, isBaseMenu } = req.body;

  if (!branchId || !name) {
    return res.status(400).json({ success: false, message: 'Branch ID and Menu name are required.' });
  }

  const isFirstMenu = (await Menu.countDocuments({ restaurant: req.restaurantId, branch: branchId })) === 0;
  const shouldBeBase = isBaseMenu === true || isBaseMenu === 'true' || isFirstMenu;

  if (shouldBeBase) {
    await Menu.updateMany(
      { restaurant: req.restaurantId, branch: branchId },
      { $set: { isBaseMenu: false } }
    );
  }

  const menu = new Menu({
    restaurant: req.restaurantId,
    branch: branchId,
    name,
    description: description || '',
    status: status || 'ACTIVE',
    isBaseMenu: shouldBeBase
  });

  await menu.save();
  return sendResponse(res, 201, 'Menu created successfully', menu);
});

// @desc    Update Menu
// @route   PUT /api/menus/:id
// @access  Private (Owner)
const updateMenu = asyncHandler(async (req, res) => {
  const { name, description, status, isBaseMenu } = req.body;

  const menu = await Menu.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!menu) {
    return res.status(404).json({ success: false, message: 'Menu not found or access denied.' });
  }

  if (name) menu.name = name;
  if (description !== undefined) menu.description = description;
  if (status) menu.status = status;

  if (isBaseMenu === true || isBaseMenu === 'true') {
    await Menu.updateMany(
      { restaurant: req.restaurantId, branch: menu.branch },
      { $set: { isBaseMenu: false } }
    );
    menu.isBaseMenu = true;
  } else if (isBaseMenu === false || isBaseMenu === 'false') {
    menu.isBaseMenu = false;
  }

  await menu.save();
  return sendResponse(res, 200, 'Menu updated successfully', menu);
});

// @desc    Set Menu as Base Menu for Branch
// @route   PATCH /api/menus/:id/base
// @access  Private (Owner)
const setBaseMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!menu) {
    return res.status(404).json({ success: false, message: 'Menu not found or access denied.' });
  }

  // Unset isBaseMenu for all menus in the same branch
  await Menu.updateMany(
    { restaurant: req.restaurantId, branch: menu.branch },
    { $set: { isBaseMenu: false } }
  );

  menu.isBaseMenu = true;
  await menu.save();

  return sendResponse(res, 200, `"${menu.name}" set as the Base Menu for this branch`, menu);
});

// @desc    Adjust Menu Item Prices by Percentage (relative to Base Menu or Current Prices)
// @route   POST /api/menus/:id/adjust-prices
// @access  Private (Owner)
const adjustMenuPrices = asyncHandler(async (req, res) => {
  const { percentage = 0, sourceMode = 'BASE_MENU' } = req.body; // sourceMode: 'BASE_MENU' | 'CURRENT_MENU'
  const targetMenuId = req.params.id;

  const targetMenu = await Menu.findOne({ _id: targetMenuId, restaurant: req.restaurantId });
  if (!targetMenu) {
    return res.status(404).json({ success: false, message: 'Target Menu not found or access denied.' });
  }

  const percentNum = Number(percentage);
  if (isNaN(percentNum)) {
    return res.status(400).json({ success: false, message: 'Valid percentage value is required.' });
  }

  // Find the Base Menu for this branch if using BASE_MENU mode
  let baseMenuMap = new Map(); // product_id -> base_price
  if (sourceMode === 'BASE_MENU') {
    const baseMenu = await Menu.findOne({
      restaurant: req.restaurantId,
      branch: targetMenu.branch,
      isBaseMenu: true
    });

    if (baseMenu) {
      const baseItems = await MenuItem.find({ menu: baseMenu._id });
      baseItems.forEach((item) => {
        if (item.product) {
          baseMenuMap.set(item.product.toString(), item.price);
        }
      });
    }
  }

  // Fetch all MenuItems in the target menu
  const targetItems = await MenuItem.find({ menu: targetMenu._id });
  let updatedCount = 0;

  for (const item of targetItems) {
    const prodIdStr = item.product ? item.product.toString() : null;
    let basePrice = item.price;

    if (sourceMode === 'BASE_MENU' && prodIdStr && baseMenuMap.has(prodIdStr)) {
      basePrice = baseMenuMap.get(prodIdStr);
    }

    // Math: basePrice * (1 + percentNum / 100) rounded to 2 decimal places
    const newPrice = Math.round(basePrice * (1 + percentNum / 100) * 100) / 100;

    item.price = Math.max(0, newPrice);
    await item.save();
    updatedCount++;
  }

  return sendResponse(res, 200, `Successfully updated ${updatedCount} prices by ${percentNum > 0 ? '+' : ''}${percentNum}% for "${targetMenu.name}"`, {
    menuId: targetMenu._id,
    menuName: targetMenu.name,
    updatedCount,
    percentage: percentNum,
    sourceMode
  });
});

// @desc    Auto-Fill / Populate Missing Menu Items from Base Menu (or Catalog) with Percentage Markup
// @route   POST /api/menus/:id/fill-missing
// @access  Private (Owner)
const fillMissingMenuItems = asyncHandler(async (req, res) => {
  const { percentage = 0, overwriteExisting = false } = req.body;
  const targetMenuId = req.params.id;

  const targetMenu = await Menu.findOne({ _id: targetMenuId, restaurant: req.restaurantId });
  if (!targetMenu) {
    return res.status(404).json({ success: false, message: 'Target Menu not found or access denied.' });
  }

  const percentNum = Number(percentage) || 0;

  // Find the Base Menu for this branch
  let baseMenu = await Menu.findOne({
    restaurant: req.restaurantId,
    branch: targetMenu.branch,
    isBaseMenu: true
  });

  // If no base menu exists or target is the base menu itself, fallback to querying all products in branch
  let sourceProducts = []; // Array of { productId, basePrice }

  if (baseMenu && baseMenu._id.toString() !== targetMenuId) {
    const baseItems = await MenuItem.find({ menu: baseMenu._id });
    sourceProducts = baseItems.map((item) => ({
      productId: item.product.toString(),
      basePrice: item.price
    }));
  } else {
    // Query all catalog products in the branch
    const catalogProds = await Product.find({ restaurant: req.restaurantId, branch: targetMenu.branch });
    sourceProducts = catalogProds.map((prod) => ({
      productId: prod._id.toString(),
      basePrice: 0
    }));
  }

  // Get existing MenuItem entries in target menu
  const existingTargetItems = await MenuItem.find({ menu: targetMenu._id });
  const existingProductMap = new Map(); // prodId -> MenuItem document
  existingTargetItems.forEach((item) => {
    if (item.product) {
      existingProductMap.set(item.product.toString(), item);
    }
  });

  let addedCount = 0;
  let updatedCount = 0;

  for (const src of sourceProducts) {
    const calculatedPrice = Math.round(src.basePrice * (1 + percentNum / 100) * 100) / 100;
    const existingItem = existingProductMap.get(src.productId);

    if (!existingItem) {
      // Create new MenuItem
      const newItem = new MenuItem({
        menu: targetMenu._id,
        product: src.productId,
        price: Math.max(0, calculatedPrice),
        available: true
      });
      await newItem.save();
      addedCount++;
    } else if (overwriteExisting) {
      // Overwrite existing price
      existingItem.price = Math.max(0, calculatedPrice);
      await existingItem.save();
      updatedCount++;
    }
  }

  return sendResponse(res, 200, `Populated "${targetMenu.name}"! (${addedCount} missing items added, ${updatedCount} prices updated)`, {
    targetMenuId: targetMenu._id,
    targetMenuName: targetMenu.name,
    addedCount,
    updatedCount,
    percentage: percentNum
  });
});

// @desc    Delete Menu (and its MenuItems)
// @route   DELETE /api/menus/:id
// @access  Private (Owner)
const deleteMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!menu) {
    return res.status(404).json({ success: false, message: 'Menu not found or access denied.' });
  }

  await Promise.all([
    MenuItem.deleteMany({ menu: menu._id }),
    Menu.findByIdAndDelete(menu._id)
  ]);

  return sendResponse(res, 200, 'Menu deleted successfully.');
});

module.exports = {
  getMenus,
  getPriceMatrix,
  createMenu,
  updateMenu,
  setBaseMenu,
  adjustMenuPrices,
  fillMissingMenuItems,
  deleteMenu
};
