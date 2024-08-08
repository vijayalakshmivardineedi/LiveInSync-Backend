const express = require('express');
const { createInventory, deleteInventory, getAllInventory, updateInventoryItem, getInventoryById } = require('../controllers/Inventory');
const router = express.Router();

router.post('/createInventory', createInventory);
router.get('/getInventoryById/:id', getInventoryById);
router.get('/getAllInventory/:societyId', getAllInventory);
router.put('/updateInventory/:id', updateInventoryItem);
router.delete('/deleteInventory/:id', deleteInventory);

module.exports = router;