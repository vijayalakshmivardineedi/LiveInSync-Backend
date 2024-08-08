const express = require('express');
const router = express.Router();
const { createAdvertisements, getAdvertisements, getAdvertisementsById, getAdvertisementsByAdv, editAdvertisement, deleteAdvertisement, getAllAdds } = require('../controllers/Advertisements');


router.post('/createAdvertisements', createAdvertisements);
router.get('/getAllAdds', getAllAdds);
router.get('/getAdvertisements/:societyId', getAdvertisements);
router.get('/getAdvertisementsById/:id', getAdvertisementsById);
router.get('/getAdvertisementsByAdv/:adv', getAdvertisementsByAdv);
router.put('/editAdvertisement/:id', editAdvertisement);
router.delete('/deleteAdvertisement/:id', deleteAdvertisement);

module.exports = router;