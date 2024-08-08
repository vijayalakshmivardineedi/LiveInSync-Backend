const express = require('express');
const { createAmenity, getAllAmenityBySocietyId, updateAmenity, deleteAmenity, bookAmenity, getAmenityByIdAndUserId, updateAmenityBooking, deleteAmenityBooking, getAmenityOfCommunityHal, getAmenityById } = require('../controllers/Amenities');
const router = express.Router();

router.post('/createAmenity', createAmenity);
router.get('/getAllAmenityBySocietyId/:societyId', getAllAmenityBySocietyId);
router.get('/getAmenityById/:id', getAmenityById);
router.get('/getAmenityOfCommunityHal/:societyId', getAmenityOfCommunityHal);
router.put('/updateAmenity/:id', updateAmenity);
router.delete('/deleteAmenity/:id', deleteAmenity);


router.put('/bookAmenity/:id', bookAmenity);
router.get('/getAmenityByIdAndUserId/:id/:userId', getAmenityByIdAndUserId);
router.put('/updateAmenityBooking/:id/:userId', updateAmenityBooking);
router.delete('/deleteAmenityBooking/:id/:userId', deleteAmenityBooking);

module.exports = router;