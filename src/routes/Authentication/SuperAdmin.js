const express=require('express');
const {signup, signin, signout, verifyCode, resetPassword}=require("../../controllers/Authentication/SuperAdmin");
const {forgotPassword}=require("../../controllers/Authentication/SuperAdmin");
const { validateSignUpRequest,validateSignInRequest, isRequestValidated } = require('../../validator/auth');
const { requireSignIn, superAdminMiddleware } = require('../../common-middlewares/index');

const router=express.Router();

router.post('/admin/signin', validateSignInRequest,isRequestValidated , signin );
router.post('/admin/signup',validateSignUpRequest, isRequestValidated , signup);
router.post('/admin/signout', requireSignIn, superAdminMiddleware, signout);
router.post('/admin/forgotPassword', forgotPassword);



router.post("/admin/verifyCode", verifyCode);
router.post("/admin/resetPassword", resetPassword);

module.exports=router;