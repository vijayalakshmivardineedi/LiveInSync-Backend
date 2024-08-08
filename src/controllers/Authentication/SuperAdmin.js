const SuperAdmin = require('../../models/Authentication/SuperAdmin');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../../validator/email');
const { generateJwtToken, generateVerificationCode } = require('../../common-middlewares/code');
const NodeCache = require('node-cache');
const emailVerificationCache = new NodeCache();


exports.signup = async (req, res) => {
  try {
    console.log("Signup request body:", req.body);
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (superAdmin) {
      return res.status(400).json({ message: "SuperAdmin already registered" });
    }

    const { firstName, secondName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _superAdmin = new SuperAdmin({
      firstName,
      secondName,
      email,
      hash_password,
      role: "SuperAdmin",
    });

    const data = await _superAdmin.save();
    console.log("SuperAdmin saved:", data);

    if (data) {
      try {
        await sendEmail(
          email,
          "Account Creation",
          `Hi ${firstName}\nWe are delighted to inform you that your admin account has been successfully created.\nWELCOME TO LivInSync`
        );
        console.log("Email sent successfully");
        return res
          .status(201)
          .json({ message: "SuperAdmin created successfully" });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        return res.status(500).json({ message: "Failed to send email" });
      }
    }
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};


exports.signin = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (!superAdmin) {
      return res.status(400).json({ message: "SuperAdmin not found" });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, superAdmin.hash_password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    if (superAdmin.role !== "SuperAdmin") {
      return res.status(400).json({ message: "You do not have admin privileges" });
    }

    const token = generateJwtToken(superAdmin._id, superAdmin.role);
    const { _id, firstName, secondName, email, role, fullName } = superAdmin;

    res.status(200).json({
      token,
      superAdmin: { _id, firstName, secondName, email, role, fullName },
    });

  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


exports.signout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    message: 'SignOut successfully...!'
  });
}


exports.forgotPassword = async (req, res) => {
  const to = req.body.email;
  const subject = 'Forgot Password Verification Code';

  try {
    const superAdmin = await SuperAdmin.findOne({ email: to });

    if (!superAdmin) {
      return res.status(404).send('Email not found in our database');
    }

    const verificationCode = generateVerificationCode();
    const text = `Your verification code is: ${verificationCode}`;

    console.log(`Storing verification code in cache for email: ${to}`);
    emailVerificationCache.set(to, verificationCode, 600);

    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Email content: ${text}`);

    sendEmail(to, subject, text);

    res.send('Verification code sent to your email');
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).send('Internal server error');
  }
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const storedCode = emailVerificationCache.get(email);

    if (!storedCode || storedCode !== code) {
      return res.status(400).send("Invalid verification code");
    }

    // Store the email in a temporary cache or database for password reset
    emailVerificationCache.set(email, { verified: true });

    res.send("Code verified successfully. You can now reset your password");
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Error verifying code");
  }
};


exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Check if the email is in the cache and the code has been verified
    const verificationStatus = emailVerificationCache.get(email);
    console.log("Verification status:", verificationStatus);

    if (!verificationStatus || !verificationStatus.verified) {
      return res.status(400).send("Email is not verified or code is invalid");
    }

    const superAdmin = await SuperAdmin.findOne({ email });
    console.log("Super admin:", superAdmin);

    if (!superAdmin) {
      return res.status(404).send("Email not found in our database");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    superAdmin.hash_password = hashedPassword;

    await superAdmin.save();

    // Remove the email from cache after password reset
    emailVerificationCache.del(email);

    res.send("Password reset successfully");
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).send("Error resetting password");
  }
};

