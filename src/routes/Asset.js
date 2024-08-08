const express = require('express');
const { createAssets, getAllAssetsBySocietyId, getAssetByIdAndSocietyId, updateAsset, deleteAsset, createRegistration } = require('../controllers/Asset');
const router = express.Router();

router.post('/createAssets', createAssets);
router.get('/getAllAssetsBySocietyId/:societyId', getAllAssetsBySocietyId);
router.get('/getAssetByIdAndSocietyId/:societyId/:assetId', getAssetByIdAndSocietyId);
router.put('/updateAsset/:societyId/:assetId', updateAsset);
router.put('/createRegistration/:societyId/:assetId', createRegistration);
router.delete('/deleteAsset/:societyId/:assetId', deleteAsset);

module.exports = router;