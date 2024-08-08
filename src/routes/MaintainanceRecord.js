const express = require('express');
const { createMaintenanceRecords, getByMonthAndYear, updatePaymentDetails, getPaymentsBySocietyBlockFlat, updatePaymentStatus, getPaymentsBySocietyBlockFlatMonthAndYear, getAllMonthsBySocietyId } = require('../controllers/MaintainanceRecord');
const router =express.Router();

router.post('/createMaintenanceRecords', createMaintenanceRecords);
router.get('/getByMonthAndYear/:societyId/:monthAndYear', getByMonthAndYear);
router.put('/updatePaymentDetails', updatePaymentDetails);
router.get('/getPaymentsOfEach/:societyId/:blockno/:flatno', getPaymentsBySocietyBlockFlat);
router.get('/getOne/:societyId/:blockno/:flatno/:monthAndYear', getPaymentsBySocietyBlockFlatMonthAndYear);
router.put('/updatePaymentStatus', updatePaymentStatus);
router.get('/getAllMonthsBySocietyId/:societyId', getAllMonthsBySocietyId);

module.exports = router;
