const express = require('express');
const router = express.Router();
const { getMenus, getPriceMatrix, createMenu, updateMenu, setBaseMenu, adjustMenuPrices, fillMissingMenuItems, deleteMenu } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { requireTenant } = require('../middleware/tenantMiddleware');

router.use(protect, requireTenant);

router.get('/price-matrix', getPriceMatrix);

router.patch('/:id/base', setBaseMenu);
router.post('/:id/adjust-prices', adjustMenuPrices);
router.post('/:id/fill-missing', fillMissingMenuItems);

router.route('/')
  .get(getMenus)
  .post(createMenu);

router.route('/:id')
  .put(updateMenu)
  .delete(deleteMenu);

module.exports = router;
