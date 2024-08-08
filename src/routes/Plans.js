const express = require('express');
const { createPlan, getPlanById, deleteFeatureInPlan, deletePlan, updatePlan,getAllplans } = require('../controllers/Plans');
const router = express.Router();

router.post('/createPlan', createPlan);
router.get('/getAllplans', getAllplans);
router.get('/getPlanById/:id', getPlanById);
router.put('/updatePlan/:id', updatePlan);
router.delete('/deletePlan/:id', deletePlan);
router.delete('/deleteFeatureInPlan/:id/:featureId', deleteFeatureInPlan);

module.exports = router;