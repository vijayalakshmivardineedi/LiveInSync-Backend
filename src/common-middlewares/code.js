const jwt=require('jsonwebtoken');

exports.generateJwtToken = (_id, role) => {
    console.log(process.env.JWT_SECRET)
    return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  };


exports.generateVerificationCode = function() {
    // Generate a random verification code here, e.g., a 6-digit number
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
  };



exports.generateVerificationToken = (email) => {
  // Implement your token generation logic here
  // For example, you can use a library like crypto to generate a random token
  const crypto = require('crypto');
  const tokenLength = 40; // The length of the random token part
  const tokenBytes = crypto.randomBytes(tokenLength / 2);
  const randomToken = tokenBytes.toString('hex');
  
  // Include the token's expiration time, which is 10 minutes from the current time
  const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds

  // Combine the random token, expiration time, and the email address with a delimiter
  const tokenWithExpiration = `${randomToken}:${expirationTime}:${email}`;

  return tokenWithExpiration;
};



exports.ScheduledDateTime = (req, res, next) => {
  req.scheduledDateTime = req.body.scheduledDateTime ? new Date(req.body.scheduledDateTime) : new Date();
  next();
};



exports.ScheduledDateTimeExat = (req, res, next) => {
  const requestedDateTime = req.body.appointmentDate ? new Date(req.body.appointmentDate) : null;

  if (requestedDateTime && requestedDateTime > new Date()) {
    // If the requestedDateTime is provided and it's in the future, use it
    req.scheduledDateTime = requestedDateTime;
  } else {
    // If not provided or in the past, default to the current date and time
    req.scheduledDateTime = new Date();
  }

  next();
};
