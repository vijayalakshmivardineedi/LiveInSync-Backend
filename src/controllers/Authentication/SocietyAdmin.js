const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../../validator/email');
const SocietyAdmin = require('../../models/Authentication/SocietyAdmin');
const { generateVerificationCode, generateJwtToken } = require('../../common-middlewares/code');
const NodeCache = require('node-cache');
const SuperAdminPayments = require('../../models/Superadmin/PaymentHistory');
const notifyModel = require('../../models/Notifications');									  
const emailVerificationCache = new NodeCache();
const saltRounds = 10;
const generatedProductCodes = new Set(); // Define a set to store generated product codes


const generateLicense = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let productCode;
    let numberOfNumbers = 0;
    do {
        productCode = 'LIS-';
        numberOfNumbers = 0;
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            const randomChar = characters[randomIndex];
            // Check if the character is a number
            if (/\d/.test(randomChar)) {
                numberOfNumbers++;
            }
            productCode += randomChar;
        }
    } while (generatedProductCodes.has(productCode) || numberOfNumbers < 3); // Check for uniqueness and at least three numbers
    generatedProductCodes.add(productCode); // Add the generated product code to the set
    return productCode;
};


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '../../Uploads/SocietyProfile');
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname);
    }
});

const upload = multer({ storage }).fields([
    { name: "societyImage", maxCount: 5 },

]);

exports.societySignup = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.log("Error in uploading files:", err);
                return res.status(500).json({ success: false, message: 'An error occurred in uploading files' });
            }

            try {
                const existingSocietyAdmin = await SocietyAdmin.findOne({ email: req.body.email });

                if (existingSocietyAdmin) {
                    return res.status(400).json({
                        message: "SocietyAdmin already registered",
                    });
                }

                const {
                    societyName,
                    email,
                    superAdminId,
                    societyMobileNumber,
                    city,
                    societyAdress,
                    memberShip,
                    price,
                    blocks,
                    gates,
                    selectedFeatures,
                    activeStatus,
                    paymentMethod,
                    transactionId,
                    paymentStatus
                } = req.body;

                const licenseId = generateLicense();
                const hash_password = await bcrypt.hash(req.body.password, 10);

                const startDate = new Date();
                const expiryDate = new Date();
                expiryDate.setFullYear(startDate.getFullYear() + 1);
									   

                let societyImages = [];
                if (req.files && req.files['societyImage'] && req.files['societyImage'].length > 0) {
                    societyImages = req.files['societyImage'].map(file => `/publicSocietyImages/${file.filename}`);
                }

                const newSocietyAdmin = new SocietyAdmin({
                    licenseId,
                    societyName,
                    email,
                    superAdminId,
                    societyMobileNumber,
                    societyImage: societyImages,
                    hash_password,
                    city,
                    societyAdress,
                    memberShip,
                    price,
                    startDate,
                    expiryDate,
                    blocks,
                    gates,
                    selectedFeatures,
                    activeStatus,
                    paymentMethod,
                    transactionId,
                    paymentStatus,
                    isRenewal: false,
                    paymentDate: new Date(),
									
                });


                const data = await newSocietyAdmin.save();
					      if (data) {
                    const SuperPayments = new SuperAdminPayments({
                        societyId: data._id,
                        licenseId,
                        societyName,
                        memberShip,
                        price,
                        activeStatus,
                        paymentMethod,
                        transactionId,
                        paymentStatus,
                        paymentDate: new Date(),
                        startDate,
                        expiryDate,
                        isRenewal: false
                    })
                    await SuperPayments.save()
                    const notifyData = new notifyModel({
                        Category: "Society Registered",
                        SenderName: societyName,
                        societyId: data._id,
                    })
                    await notifyData.save()
                }
                if (data) {
                    try {
                        await sendEmail(
                            email,
                            "Account Creation",
                            `Hi ${societyName}\nWe are delighted to inform you that your Society Admin account has been successfully created.\nWELCOME TO LivInSync`
                        );
                        return res.status(201).json({
                            message: "SocietyAdmin created successfully",
                        });
                    } catch (emailError) {
                        console.error("Email sending error:", emailError);
                        return res.status(500).json({
                            message: "Failed to send email",
                        });
                    }
                }
            } catch (error) {
                console.log("Error:", error);
                return res.status(500).json({
                    message: "Something Went Wrong",
                    error: error.message,
                    stack: error.stack
                });
            }
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            message: "Something Went Wrong",
        });
    }
};
											 
										  

exports.societySignin = async (req, res) => {
    try {
        console.log(req.body.email)
	  
        const societyAdmin = await SocietyAdmin.findOne({ email: req.body.email });

        if (!societyAdmin) {
            return res.status(400).json({ message: "SocietyAdmin not found" });
        }

										 
        const isPasswordValid = await bcrypt.compare(req.body.password, societyAdmin.hash_password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Password" });
        }

									 
        if (societyAdmin.role !== "SocietyAdmin") {
            return res.status(400).json({ message: "You do not have admin privileges" });
        }

							 
        const token = generateJwtToken(societyAdmin._id, societyAdmin.role);
        const { _id, societyname, email, role } = societyAdmin;

											  
														
        res.status(200).json({
            token,
            societyAdmin: { _id, societyname, email, role },
        });

    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

exports.societySignout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        message: 'SignOut successfully...!'
    });
};


exports.societyForgotPassword = async (req, res) => {
    const to = req.body.email;
    const subject = 'Forgot Password Verification Code';

    try {
        const societyAdmin = await SocietyAdmin.findOne({ email: to });

        if (!societyAdmin) {
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

exports.societyVerifyCodeAndResetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    console.log(email, code, newPassword)
    try {
        const storedCode = emailVerificationCache.get(email);

        if (!storedCode || storedCode !== code) {
            return res.status(400).send('Invalid verification code');
        }

        const societyAdmin = await SocietyAdmin.findOne({ email });

        if (!societyAdmin) {
            return res.status(404).send('Email not found in our database');
        }

        if (!newPassword) {
            return res.status(400).send('New password is required');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        societyAdmin.hash_password = hashedPassword;

        await societyAdmin.save();

        res.send('Password reset successfully');
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).send('Error resetting password');
    }
};

exports.updateSocietyAdminProfile = async (req, res) => {
    const { id } = req.params;
    upload(req, res, async (err) => {
        if (err) {
            console.error("Error uploading files:", err);
            return res.status(500).json({
                success: false,
                message: "An error occurred while uploading files.",
            });
        }

        const updateFields = req.body;

        // Handle societyImage files
        if (req.files && req.files['societyImage'] && req.files['societyImage'].length > 0) {
            updateFields.societyImage = req.files['societyImage'].map(file => `/publicSocietyImages/${file.filename}`);
        }

        // Handle documents files
        if (req.files && req.files['documents'] && req.files['documents'].length > 0) {
            updateFields.documents = req.files['documents'].map(file => `/publicSocietyDocuments/${file.filename}`);
        }

        try {
            // Find the existing admin profile to get the old files
            const existingProfile = await SocietyAdmin.findById(id);
            if (!existingProfile) {
                return res.status(404).json({ message: "Admin Profile not found" });
            }

            // Delete old files from file system and updateFields
            if (updateFields.societyImage && existingProfile.societyImage) {
                await Promise.all(existingProfile.societyImage.map(async (file) => {
                    const filePath = path.join(__dirname, '../../Uploads/SocietyProfile', file.split('/').pop());
                    if (fs.existsSync(filePath)) {
                        await fs.promises.unlink(filePath);
                    }
                }));
            }

            if (updateFields.documents && existingProfile.documents) {
                await Promise.all(existingProfile.documents.map(async (file) => {
                    const filePath = path.join(__dirname, '../../Uploads/SocietyProfile', file.split('/').pop());
                    if (fs.existsSync(filePath)) {
                        await fs.promises.unlink(filePath);
                    }
                }));
            }

            // Update the admin profile in the database with new fields
            const updatedAdminProfile = await SocietyAdmin.findByIdAndUpdate(
                id,
                updateFields,
                { new: true }
            );

            if (!updatedAdminProfile) {
                return res.status(404).json({ message: "Society Admin Profile not found" });
            }

            res.status(200).json({
                message: "Society Admin Profile updated successfully",
                data: updatedAdminProfile,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
};

//getAllSocietiesbyCityId
exports.getSocietiesByCityId = async (req, res) => {
    const { cityId } = req.params;

    try {
        const societies = await SocietyAdmin.find({ city: cityId });
        res.status(200).json({
            societies: societies
        });
    } catch (error) {
        console.error("Error fetching societies by cityId:", error);
        res.status(500).json({
            message: "Failed to fetch societies"
        });
    }
};

//getSocietybySocietyId
exports.getSocietyById = async (req, res) => {
    const { societyId } = req.params;

    try {
        const society = await SocietyAdmin.findById(societyId);
        if (!society) {
            return res.status(404).json({ message: "Society not found" });
        }
        res.status(200).json({
            society: society
        });
    } catch (error) {
        console.error("Error fetching society by societyId:", error);
        res.status(500).json({
            message: "Failed to fetch society"
        });
    }
};

// getAllSocieties
exports.getAllSocieties = async (req, res) => {
    try {
        const societies = await SocietyAdmin.find();
        res.status(200).json({
            societies: societies
        });
    } catch (error) {
        console.error("Error fetching all societies:", error);
        res.status(500).json({
            message: "Failed to fetch societies"
        });
    }
};


//renewal socity plan
// exports.renewSocietyPlan = async (req, res) => {
//     console.log(req.body)
//     try {
//         const { societyId, newPlan, paymentMethod, paymentStatus, selectedFeatures, transactionId, price } = req.body;

//         // Find the society by ID
//         const society = await SocietyAdmin.findById(societyId);

//         if (!society) {
//             return res.status(404).json({ message: "Society not found" });
//         }
//         const startDate = new Date();
//         const expiryDate = new Date();
//         expiryDate.setFullYear(startDate.getFullYear() + 1);
//         // Update the society's plan details
//         expiryDate.setFullYear(startDate.getFullYear() + 1); // Add one year to the start date
//         society.startDate = startDate;
//         society.expiryDate = expiryDate;
//         society.memberShip = newPlan;
//         society.paymentMethod = paymentMethod;
//         society.transactionId = transactionId;
//         society.paymentStatus = paymentStatus;
//         society.price = price;
//         society.paymentDate = new Date();
//         // Update selected features if provided
//         if (selectedFeatures) {
//             society.selectedFeatures = selectedFeatures;
//         }
//         // Save the updated society details
//         await society.save();
//         if (society) {
//             const SuperPayments = new SuperAdminPayments({
//                 societyId: society._id,
//                 licenseId: society.licenseId,
//                 societyName: society.societyName,
//                 memberShip: newPlan,
//                 price: price,
//                 activeStatus: true,
//                 paymentMethod,
//                 transactionId,
//                 paymentStatus,
//                 paymentDate: new Date(),
//                 startDate,
//                 expiryDate,
//                 isRenewal: true
//             })
//             await SuperPayments.save()
//         }
//         return res.status(200).json({ message: "Society plan renewed successfully" });
//     } catch (error) {
//         console.error("Error renewing society plan:", error);
//         return res.status(500).json({ message: "Something Went Wrong" });
//     }
// };

exports.renewSocietyPlan = async (req, res) => {
    console.log(req.body);
    try {
        const { societyId, newPlan, paymentMethod, paymentStatus, selectedFeatures, transactionId, price } = req.body;

        // Find the society by ID
        const society = await SocietyAdmin.findById(societyId);

        if (!society) {
            return res.status(404).json({ message: "Society not found" });
        }

        const startDate = new Date();
        const expiryDate = new Date();
															
											
        expiryDate.setFullYear(startDate.getFullYear() + 1); // Add one year to the start date

        // Update the society's plan details
        society.startDate = startDate;
        society.expiryDate = expiryDate;
        society.memberShip = newPlan;
        society.paymentMethod = paymentMethod;
        society.transactionId = transactionId;
        society.paymentStatus = paymentStatus;
        society.price = price;
		society.isRenewal = true
        society.paymentDate = new Date();
        society.selectedFeatures = selectedFeatures
		
        // Update selected features if provided
        // if (selectedFeatures) {
        //     // Convert selectedFeatures from object to Map if necessary
        //     society.selectedFeatures = new Map(Object.entries(selectedFeatures));
        // }

        // Save the updated society details
        await society.save();

        // Log payment details
        if (society) {
            const SuperPayments = new SuperAdminPayments({
                societyId: society._id,
                licenseId: society.licenseId,
                societyName: society.societyName,
                memberShip: newPlan,
                price: price,
                activeStatus: true,
                paymentMethod,
                transactionId,
                paymentStatus,
                paymentDate: new Date(),
                startDate,
                expiryDate,
                isRenewal: true

            });
            await SuperPayments.save();
        }

        return res.status(200).json({ message: "Society plan renewed successfully" });
    } catch (error) {
        console.error("Error renewing society plan:", error);
        return res.status(500).json({ message: "Something Went Wrong" });
    }
};




						 
													
								  

//reset password
exports.societyResetPassword = async (req, res) => {
    try {
        const { currentPassword, password, societyId } = req.body;
        console.log(societyId, "reset password");
								
		   
					 
																	
							  
												
		   
	 
  
					   
											  
									 

        // Validate new password length
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
																		  
        }
							  
							
		   
					 
																	 
							  
											  
		   
	 
  

        // Validate societyId
        if (!mongoose.Types.ObjectId.isValid(societyId)) {
            return res.status(400).json({ message: 'Invalid Society ID.' });
        }

        const societyAdmin = await SocietyAdmin.findById(societyId);
        if (!societyAdmin) {
            return res.status(404).json({ message: 'Society not found.' });
        }

        // Check if the current password matches
        const isMatch = await bcrypt.compare(currentPassword, societyAdmin.hash_password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the password using findByIdAndUpdate
        await SocietyAdmin.findByIdAndUpdate(
            societyId,
            { hash_password: hashedPassword },
            { new: true } // Return the updated document
        );

        return res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
												
		   
    }
};

