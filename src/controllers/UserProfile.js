
const multer = require('multer');
const UserProfile = require('../models/UserProfile');
const path = require('path');
const fs = require('fs');
const shortid = require('shortid');
const { sendEmail } = require('../validator/email');
const { generateVerificationCode, generateJwtToken } = require('../common-middlewares/code');
const NodeCache = require('node-cache');
const Sequrity = require('../models/Authentication/Security');
const SocietyAdmin = require('../models/Authentication/SocietyAdmin');
const emailVerificationCache = new NodeCache();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '../Uploads/UserProfile');
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname);
    }
});

const upload = multer({ storage }).single('profilePicture');


exports.sendVerificationEmail = async (req, res) => {
    console.log(req.body);
    try {
        const { email } = req.body;
        const existingUser = await UserProfile.findOne({ email });
        const existingAdmin = await SocietyAdmin.findOne({ email });
        if (existingUser || existingAdmin) {
            return res.status(400).json({ success: false, message: "Email already exists." });
        }
        const otp = generateVerificationCode();
        console.log("otp:", otp)
        await sendEmail(email, "Verification Code", `Your verification code is: ${otp}`);

        emailVerificationCache.set(email, otp, 600);

        return res.status(200).json({ success: true, message: "Verification email sent. Please check your email for OTP." });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.VerifyUserProfile = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log(email, otp);
        const storedOtp = emailVerificationCache.get(email);
        console.log(storedOtp);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }
        const userId = shortid.generate();

        const userProfile = new UserProfile({
            userId,
            email,
            role: "User",
        });
        await userProfile.save();
        return res.status(201).json({ success: true, userProfile, message: "User profile created successfully" });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: error.message });
    }
};

exports.createUserProfile = async (req, res) => {
    console.log(req.body, "data");
    try {
        const { id } = req.params;
        const {
            name,
            mobileNumber,
            societyId,
            userType,
            society,
            block,
            flat,
            password,
        } = req.body;
        console.log(name,
            mobileNumber,
            societyId,
            userType,
            society,
            block,
            flat,
            password)
        let userProfile = await UserProfile.findById(id);
        if (!userProfile) {
            return res.status(404).json({ success: false, message: "User profile not found." });
        }

        const hash_password = await bcrypt.hash(password, saltRounds);
        userProfile.name = name;
        userProfile.mobileNumber = mobileNumber;
        userProfile.societyId = societyId;
        userProfile.userType = userType;
        userProfile.societyName = society;
        userProfile.buildingName = block;
        userProfile.flatNumber = flat;
        userProfile.hash_password = hash_password;

        await userProfile.save();
        return res.status(200).json({ success: true, message: "User profile updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: error.message });
    }
};


exports.userSignin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);

        let userProfile = await UserProfile.findOne({ email });
        let securityProfile = await Sequrity.findOne({ email });

        if (!userProfile && !securityProfile) {
            return res.status(400).json({ message: "User not found" });
        }

        let profile;
        let profileType;

        if (userProfile) {
            profile = userProfile;
            profileType = "User";
        } else if (securityProfile) {
            profile = securityProfile;
            profileType = "Sequrity";
        }

        const isPasswordValid = await bcrypt.compare(password, profile.hash_password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        if (profileType === "User" && profile.role !== "User") {
            return res.status(400).json({ message: "You do not have User privileges" });
        } else if (profileType === "Sequrity" && profile.role !== "Sequrity") {
            return res.status(400).json({ message: "You do not have Sequrity privileges" });
        }

        const token = generateJwtToken(profile._id, profile.role);

        res.status(200).json({
            token,
            profile,
        });

    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getAllUserProfilesBySocietyId = async (req, res) => {

    const { societyId } = req.params;
    try {
        const userProfiles = await UserProfile.find({ societyId });
        return res.status(201).json({ success: true, userProfiles });
    } catch (error) {
        return res.status(500).json({ success: false, message: "No Users Found!!!" });
    }
};

exports.getUserProfilesByIdAndSocietyId = async (req, res) => {
    try {
        const { userId, societyId } = req.params;
        const userProfiles = await UserProfile.find({
            userId: userId,
            societyId: societyId
        });
        res.status(200).json({ success: true, userProfiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserProfiles = async (req, res) => {
    try {
        const userId = req.params.id;
        const userProfiles = await UserProfile.find({ userId });
        res.send(userProfiles);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        upload(req, res, async (error) => {
            if (error) {
                return res.status(301).json({ success: false, message: "Error in Uploading file:", error });
            }
            const { id } = req.params;
            const uploadFields = { ...req.body };
            delete uploadFields.id;

            try {
                const userprofile = await UserProfile.findById(id);
                if (!userprofile) {
                    return res.status(401).json({ success: false, message: "No Match Found" });
                }

                // Handle file upload if profilePicture field is present
                if (req.file) {
                    // Delete old file if exists
                    if (userprofile.profilePicture) {
                        const oldImagePath = path.join(__dirname, '../Uploads/UserProfile', path.basename(userprofile.profilePicture));
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath);
                            console.log("Successfully deleted the old file");
                        }
                    }

                    // Update profilePicture field in uploadFields
                    uploadFields.profilePicture = `/publicUser/${req.file.filename}`;
                }

                const updatedUserProfile = await UserProfile.findByIdAndUpdate(id, { $set: uploadFields }, { new: true });
                return res.status(201).json({ success: true, message: "Successfully Updated", userProfile: updatedUserProfile });

            } catch (error) {
                return res.status(501).json({ success: false, message: error });
            }

        });

    } catch (error) {
        return res.status(501).json({ success: false, message: error });
    }
};

exports.deleteUserProfile = async (req, res) => {
    try {
        const _id = req.params.id;
        const userProfile = await UserProfile.findById(_id);

        if (!userProfile) {
            return res.status(404).json({ success: false, message: "User profile not found" });
        }

        // Delete profile picture from the filesystem if it exists
        if (userProfile.profilePicture) {
            const imagePath = path.join(__dirname, '../Uploads/UserProfile', path.basename(userProfile.profilePicture));
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`Deleted profile picture: ${imagePath}`);
                } catch (error) {
                    console.error(`Error deleting profile picture: ${error}`);
                }
            }
        }

        // Delete the user profile document from the database
        await UserProfile.findByIdAndDelete(_id);

        return res.status(200).json({ success: true, message: "User profile and associated picture deleted successfully" });

    } catch (error) {
        console.error(`Error deleting user profile: ${error}`);
        return res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};



exports.sendForgotVerificationEmail = async (req, res) => {
    console.log(req.body);
    try {
        const { email } = req.body;
        const existingUser = await UserProfile.findOne({ email });
        const existingAdmin = await SocietyAdmin.findOne({ email });

        if (!existingUser && !existingAdmin) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        const otp = generateVerificationCode();

        await sendEmail(email, "Forgot Password Verification Code", `Your verification code is: ${otp}`);

        emailVerificationCache.set(email, otp, 600);

        return res.status(200).json({ success: true, message: "Verification email sent. Please check your email for OTP." });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.verifyForgotVerificationOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedOtp = emailVerificationCache.get(email);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        emailVerificationCache.set(`${email}_verified`, true, 600); 

        return res.status(200).json({ success: true, message: "OTP verified successfully. You can now update your password." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: payload.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const isVerified = emailVerificationCache.get(email);

        if (!isVerified) {
            return res.status(400).json({ success: false, message: "OTP not verified or verification expired." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        let user = await UserProfile.findOne({ email });
        if (user) {
            user.hash_password = hashedPassword;
            await user.save();
        } else {
            user = await SocietyAdmin.findOne({ email });
            if (user) {
                user.hash_password = hashedPassword;
                await user.save();
            }
        }
        emailVerificationCache.del(email);
        emailVerificationCache.del(`${email}_verified`);

        return res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { currentPassword, password, userId } = req.body;
        console.log(currentPassword, password, userId, "reset password");
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }
        const userProfile = await UserProfile.findById(userId);
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, userProfile.hash_password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        userProfile.hash_password = hashedPassword;
        await userProfile.save();

        return res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
exports.getAllOwners = async (req, res) => {
    const { societyId } = req.params;
    try {
        const userProfiles = await UserProfile.find({ 
            societyId: societyId,
            userType:"Owner"
         });
        return res.status(201).json({ success: true, userProfiles });
    } catch (error) {
        return res.status(500).json({ success: false, message: "No Users Found!!!" });
    }
};

// Add FAmily Memebers
exports.AddFamilyMembersBySocietyIdandUSerId = async (req, res) => {

    const { name, age, relation, gender, mobileNumber } = req.body;
    const { userId, societyId } = req.params
    try {
        // Find the user profile by user ID and society ID
        const userProfile = await UserProfile.findOne({ userId, societyId });
        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        const familyData = {
            name,
            age,
            Relation: relation,
            gender,
            mobileNumber,
        }
        // Add the new family member to the familyMembers array
        userProfile.familyMembers.push(familyData);
        // Save the updated user profile
        await userProfile.save();
        return res.status(200).json({ success: true, message: 'Family member added successfully', userProfile });
    } catch (error) {
        console.error('Error adding family member:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}
exports.DeleteFamilyMembersBySocietyIdandUSerId = async (req, res) => {
    const { userId, societyId, id } = req.params;
    try {
        // Find the user profile by user ID and society ID
        const userProfile = await UserProfile.findOne({ userId, societyId });
        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        // Find the family member by their ID and remove them from the familyMembers array
        const familyMemberIndex = userProfile.familyMembers.findIndex(member => member._id.toString() === id);
        if (familyMemberIndex === -1) {
            return res.status(404).json({ success: false, message: 'Family member not found' });
        }
        userProfile.familyMembers.splice(familyMemberIndex, 1);
        // Save the updated user profile
        await userProfile.save();
        return res.status(200).json({ success: true, message: 'Family member deleted successfully', userProfile });
    } catch (error) {
        console.error('Error deleting family member:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
// add vehicle details
exports.AddVehicleDetailsBySocietyIdandUSerId = async (req, res) => {
    const { brand, modelName, vehicleNumber, vehicleType, driverName, phoneNumber } = req.body;
    const { userId, societyId } = req.params
    try {
        // Find the user profile by user ID and society ID
        const userProfile = await UserProfile.findOne({ userId, societyId });
        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        const vehicleData = {
            brand,
            modelName,
            vehicleNumber,
            driverName,
            type: vehicleType,
            mobileNumber: phoneNumber,
        }
        // Add the new family member to the familyMembers array
        userProfile.Vehicle.push(vehicleData);
        // Save the updated user profile
        await userProfile.save();
        return res.status(200).json({ success: true, message: ' vehicle added successfully', userProfile });
    } catch (error) {
        console.error('Error adding Vehicle:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}
exports.DeleteVehicleBySocietyIdandUSerId = async (req, res) => {
    const { userId, societyId, id } = req.params;
    try {
        // Find the user profile by user ID and society ID
        const userProfile = await UserProfile.findOne({ userId, societyId });
        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        // Find the family member by their ID and remove them from the familyMembers array
        const familyMemberIndex = userProfile.Vehicle.findIndex(member => member._id.toString() === id);
        if (familyMemberIndex === -1) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        userProfile.Vehicle.splice(familyMemberIndex, 1);
        // Save the updated user profile
        await userProfile.save();
        return res.status(200).json({ success: true, message: 'Vehicle deleted successfully', userProfile });
    } catch (error) {
        console.error('Error deleting Vehicle:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

// add Pet details

exports.AddPetDetailsBySocietyIdandUSerId = async (req, res) => {
    const { petType, petName, age, breed, gender } = req.body;
    const { userId, societyId } = req.params
    try {
        // Find the user profile by user ID and society ID
        const userProfile = await UserProfile.findOne({ userId, societyId });
        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        const petData = {
            petType,
            petName,
            age,
            breed,
            gender
        }
        userProfile.pets.push(petData);
        // Save the updated user profile
        await userProfile.save();
        return res.status(200).json({ success: true, message: ' vehicle added successfully', userProfile });
    } catch (error) {
        console.error('Error adding Vehicle:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}
exports.DeletePetBySocietyIdandUSerId = async (req, res) => {
    const { userId, societyId, id } = req.params;
    try {
        // Find the user profile by user ID and society ID
        const userProfile = await UserProfile.findOne({ userId, societyId });
        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        // Find the family member by their ID and remove them from the familyMembers array
        const familyMemberIndex = userProfile.pets.findIndex(member => member._id.toString() === id);
        if (familyMemberIndex === -1) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        userProfile.pets.splice(familyMemberIndex, 1);
        await userProfile.save();
        return res.status(200).json({ success: true, message: 'Vehicle deleted successfully', userProfile });
    } catch (error) {
        console.error('Error deleting Vehicle:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

///Get all User Profiles
exports.getAllUserProfiles = async(req, res) => {
    try {
        const userProfile = await UserProfile.find();
        return res.status(201).json({success:true, userProfile});
    } catch (error) {
        return res.status(401).json({success:false, error});
    }
}