const { check, validationResult }=require("express-validator")
exports.validateSignUpRequest =
[
    check('firstName')
    .notEmpty()
    .withMessage("firstName is required"),
    check('secondName')
    .notEmpty()
    .withMessage("secondName is required"),
    check('email')
    .isEmail()
    .withMessage("valid email is required"),
    check('password')
    .isLength({min:6})
    .withMessage("password must be at least 6 characters long"),
    // check('contactNumber')
    // .isLength({min:10,max:10})
    // .withMessage("Phone Number is Invalid"),
];
exports.validateSignInRequest =
[
    check('email')
    .isEmail()
    .withMessage("valid email is required"),
    check('password')
    .isLength({min:6})
    .withMessage("password must be at least 6 characters long"),
];
exports.isRequestValidated=(req,res,next)=>{
    const errors=validationResult(req);
    if(errors.array().length>0){
        return res.status(400).json({error:errors.array()[0].msg})
    }
    next()
}
