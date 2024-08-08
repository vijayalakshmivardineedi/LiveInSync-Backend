
const express = require('express');
const router = express.Router();
const { updateUserProfile, deleteUserProfile, getAllUserProfilesBySocietyId,getAllOwners,resetPassword,getAllUserProfiles, getUserProfilesByIdAndSocietyId, sendVerificationEmail, userSignin, VerifyUserProfile, createUserProfile, forgotPassword, sendForgotVerificationEmail, verifyForgotVerificationOTP, updatePassword, DeletePetBySocietyIdandUSerId, AddPetDetailsBySocietyIdandUSerId, DeleteVehicleBySocietyIdandUSerId, AddVehicleDetailsBySocietyIdandUSerId, DeleteFamilyMembersBySocietyIdandUSerId, AddFamilyMembersBySocietyIdandUSerId } = require("../controllers/UserProfile")


router.post('/user/sendVerificationEmail', sendVerificationEmail);
router.post('/user/VerifyUserProfile', VerifyUserProfile);
router.put('/user/createUserProfile/:id', createUserProfile);
router.post('/user/userSignin', userSignin);
router.get('/user/getAllUserProfilesBySocietyId/:societyId', getAllUserProfilesBySocietyId);
router.get('/user/getUserProfiles/:userId/:societyId', getUserProfilesByIdAndSocietyId);
router.get('/user/getAllOwners/:societyId', getAllOwners);
router.put('/user/updateUserProfile/:id', updateUserProfile);
router.delete('/user/deleteUserProfile/:id', deleteUserProfile);
router.post('/addFamilyMember/:societyId/:userId', AddFamilyMembersBySocietyIdandUSerId);
router.delete('/deleteFamilyMember/:societyId/:userId/:id', DeleteFamilyMembersBySocietyIdandUSerId);
router.post('/addVehicle/:societyId/:userId', AddVehicleDetailsBySocietyIdandUSerId);
router.delete('/deleteVehicle/:societyId/:userId/:id', DeleteVehicleBySocietyIdandUSerId);
router.post('/addPet/:societyId/:userId', AddPetDetailsBySocietyIdandUSerId);
router.delete('/deletePet/:societyId/:userId/:id', DeletePetBySocietyIdandUSerId);

router.post('/user/sendForgotVerificationEmail', sendForgotVerificationEmail);
router.post('/user/verifyForgotVerificationOTP', verifyForgotVerificationOTP);
router.post('/user/updatePassword',updatePassword);
router.post('/user/resetPassword',resetPassword);
router.get('/user/getAllUserProfiles', getAllUserProfiles);


module.exports = router;