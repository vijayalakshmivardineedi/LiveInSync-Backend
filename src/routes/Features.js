const express =  require('express');
const router = express.Router();
const { createFeature, getFeatures, getFeatureById, updateFeaturesById, deleteFeaturesById } = require('../controllers/Features');

router.post('/createFeature',createFeature);
router.get('/getFeatures', getFeatures);
router.get('/getFeatureById/:id', getFeatureById); 
router.put('/updateFeaturesById/:id', updateFeaturesById);
router.delete('/deleteFeaturesById/:id', deleteFeaturesById);

module.exports = router;