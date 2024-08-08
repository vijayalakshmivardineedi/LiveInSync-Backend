
const express=require('express');
const { createSequrity, updateSequrityProfile, getSequritiesBySocietyId, deleteSequrityProfilePicture, addAttendance, sequirtySignin,  } = require('../../controllers/Authentication/Security');
const router=express.Router();

router.post('/sequrity/createSequrity', createSequrity);
router.post('/sequrity/sequirtySignin', sequirtySignin);
router.get('/sequrity/getSequrityBySocietyId/:societyId', getSequritiesBySocietyId);
router.put('/sequrity/updateSequrityById/:sequrityId', updateSequrityProfile);
router.delete('/sequrity/deleteSequrity/:id', deleteSequrityProfilePicture);
router.put('/sequrity/addAttendance/:sequrityId', addAttendance);

module.exports=router;