const express = require('express');
const { createCommityMembers, getCommityMembersBySocietyId, getCommityMembersById, editCommityMembers, deleteCommityMembers } = require('../controllers/CommityMembers');
const router = express.Router();


router.post('/createCommityMembers', createCommityMembers);
router.get('/getCommityMembersBySocietyId/:societyId', getCommityMembersBySocietyId);
router.get('/getCommityMembersById/:id', getCommityMembersById);
router.put('/editCommityMembers/:id', editCommityMembers);
router.delete('/deletecommityMembers/:id', deleteCommityMembers);

module.exports = router;