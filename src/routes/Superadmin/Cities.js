// routes/Superadmin/cities.js
const express = require('express');
const router = express.Router();
const { createCity, getCities, getCityById, updateCity, deleteCity } = require('../../controllers/Superadmin/Cities');

// Routes for cities
router.post('/createCity', createCity); // No need to use multer middleware here
router.get('/getAllCities', getCities);
router.get('/getCity/:cityId', getCityById);
router.put('/updateCity/:cityId', updateCity); // No need to use multer middleware here
router.delete('/deleteCity/:cityId', deleteCity);

module.exports = router;
