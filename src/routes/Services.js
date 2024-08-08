const express = require('express');
const { createService, addList, deleteUserService, deleteServicePerson, updateServicePerson, getAllServicePersons, getAllServiceTypes, getServicePersonById } = require('../controllers/Services');
const router = express.Router();

router.post('/createService', createService);
router.delete('/deleteServicePerson', deleteServicePerson);
router.put('/updateServicePerson', updateServicePerson);
router.get('/getAllServicePersons/:societyId', getAllServicePersons);
router.get('/getAllServiceTypes/:societyId/:serviceType', getAllServiceTypes);
router.get('/getServicePersonById/:societyId/:serviceType/:userId', getServicePersonById);

router.put('/addList', addList);
router.delete('/deleteUserService', deleteUserService);

module.exports = router;