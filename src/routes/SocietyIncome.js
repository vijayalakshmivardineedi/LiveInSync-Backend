const express = require('express');
const { createIncome, getIncomeBySocietyId, getIncomeById, editIncome, deleteIncome } = require('../controllers/SocietyIncome');
const router = express.Router();

router.post('/createIncome', createIncome);
router.get('/getIncomeBySocietyId/:societyId', getIncomeBySocietyId);
router.get('/getIncomeById/:societyId/:id', getIncomeById);
router.put('/editIncome/:societyId/:id', editIncome);
router.delete('/deleteIncome/:societyId/:id', deleteIncome);

module.exports = router;
