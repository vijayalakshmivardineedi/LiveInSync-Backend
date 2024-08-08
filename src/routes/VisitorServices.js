const express = require('express');
const { checkInStaff, checkOutStaff } = require('../controllers/VisitorServices');
const router = express.Router();

router.post('/checkInStaff', checkInStaff);
router.put('/checkOutStaff', checkOutStaff);



module.exports = router;