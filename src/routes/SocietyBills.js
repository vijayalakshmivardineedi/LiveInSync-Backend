const express = require('express');
const router = express.Router();
const { createBill, getBillsBySocietyId, getBillById, editBill, deleteBill } = require('../controllers/SocietyBills');

router.post('/createBill', createBill);
router.get('/getBillsBySocietyId/:societyId', getBillsBySocietyId);
router.get('/getBillById/:societyId/:id', getBillById);
router.put('/editBill/:societyId/:id', editBill);
router.delete('/deleteBill/:societyId/:id', deleteBill);

module.exports = router;
