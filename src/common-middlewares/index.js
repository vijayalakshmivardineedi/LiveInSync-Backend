const jwt = require('jsonwebtoken');


exports.requireSignIn = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      // Verify the token
      const user = await jwt.verify(token, process.env.JWT_SECRET);
      // Log the generated token and verification result
      // console.log('Generated Token:', token);
      // console.log('Token Verification Result:', user);
      req.user = user;
      next();
    } catch (error) {
      console.error('Token Verification Error:', error);
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Authorization header missing" });
  }
};

exports.userMiddleware=(req,res,next)=>{
   // console.log(req.user.role)
    if(req.user.role!=="User"){
        return res.status(400).json({message:" User Access denied"})
    }
    next();
}

exports.superAdminMiddleware=(req,res,next)=>{
    if(req.user.role!=="SuperAdmin"){
        return res.status(400).json({message:" SuperAdmin Access denied"})
    }
    next();
}

exports.societyAdminMiddleware=(req,res,next)=>{
    if(req.user.role!=="SocietyAdmin"){
        return res.status(400).json({message:" SocietyAdmin Access denied"})
    }
    next();
}


 exports.sequrityMiddleware=(req,res,next)=>{
    // console.log(req.user.role)
     if(req.user.role!=="Sequrity"){
         return res.status(400).json({message:" Sequrity Access denied"})
     }
     next();
 }