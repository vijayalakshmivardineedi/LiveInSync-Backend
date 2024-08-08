const Sequrity = require('../../models/Authentication/Security');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shortid = require('shortid');
const { generateJwtToken } = require('../../common-middlewares/code');
const bcrypt = require('bcrypt');

const generatedSequrityCodes = new Set(); // Set to store generated sequrity codes

const generateSequrityCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sequrityCode;
    let numberOfNumbers = 0;
    do {
        sequrityCode = 'LIS-';
        numberOfNumbers = 0;
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            const randomChar = characters[randomIndex];
            if (/\d/.test(randomChar)) {
                numberOfNumbers++;
            }
            sequrityCode += randomChar;
        }
    } while (generatedSequrityCodes.has(sequrityCode) || numberOfNumbers < 3);
    generatedSequrityCodes.add(sequrityCode);
    return sequrityCode;
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '../../Uploads/SequrityProfile');
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname);
    }
});

const upload = multer({ storage }).single('picture'); // For single file upload

exports.createSequrity = async (req, res) => {
    try {
        upload(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
                console.error('Multer error:', error);
                return res.status(500).json({ success: false, message: 'Error uploading file', error: error.message });
            } else if (error) {
                console.error('Unknown error:', error);
                return res.status(500).json({ success: false, message: 'Unknown error', error: error.message });
            }

            if (!req.file) {
                console.error('No file uploaded.');
                return res.status(400).json({ success: false, message: 'No file uploaded.' });
            }

            const picture = `/publicSequrityPictures/${req.file.filename}`;
            const hash_password = await bcrypt.hash(req.body.password, 10);

            const {
                societyId,
                name,
                phoneNumber,
                role,
                email,
                details,
                aadharNumber,
                address,
            } = req.body;

            // Check if phoneNumber or aadharNumber already exists
            const existingSequrity = await Sequrity.findOne({
                $or: [
                    { 'phoneNumber': phoneNumber },
                    { 'aadharNumber': aadharNumber }
                ]
            });

            if (existingSequrity) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number or Aadhar number already exists.'
                });
            }

            const sequrityId = generateSequrityCode(); // Assuming this function generates a unique sequrity ID

            const newSequrity = new Sequrity({
                societyId: societyId,
                sequrityId: sequrityId,
                name: name,
                email: email,
                phoneNumber: phoneNumber,
                role: role,
                details: details,
                aadharNumber: aadharNumber,
                address: address,
                hash_password,
                pictures: picture,
            });

            const savedSequrity = await newSequrity.save();

            res.status(201).json({ success: true, message: 'Sequrity created successfully', data: savedSequrity });
        });
    } catch (error) {
        console.error('Error creating sequrity:', error);
        res.status(500).json({ success: false, message: 'Failed to create sequrity', error: error.message });
    }
};


exports.sequirtySignin = async (req, res) => {
    try {
        console.log(req.body.email)
        const Sequrityprofile = await Sequrity.findOne({ email: req.body.email });

        if (!Sequrityprofile) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, Sequrityprofile.hash_password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        if (Sequrityprofile.role !== "Sequrity") {
            return res.status(400).json({ message: "You do not have Sequrity privileges" });
        }

        const token = generateJwtToken(Sequrityprofile._id, Sequrityprofile.role);
        const { _id, name, email, role } = Sequrityprofile;

        res.status(200).json({
            token,
            Sequrityprofile: { _id, name, email, role },
        });

    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getSequritiesBySocietyId = async (req, res) => {
    const { societyId } = req.params;

    try {
        const sequrities = await Sequrity.find({ societyId: societyId });

        if (!sequrities || sequrities.length === 0) {
            return res.status(404).json({ success: false, message: 'No sequrities found for this society ID.' });
        }

        res.status(200).json({ success: true, message: 'Sequrities fetched successfully', data: sequrities });
    } catch (error) {
        console.error('Error fetching sequrities:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sequrities', error: error.message });
    }
};


exports.updateSequrityProfile = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(500).json({ success: false, message: 'Error uploading file', error: err.message });
            } else if (err) {
                console.error('Unknown error:', err);
                return res.status(500).json({ success: false, message: 'Unknown error', error: err.message });
            }

            const { sequrityId } = req.params;
            const uploadFields = { ...req.body };

            // Handle picture upload if a new picture is uploaded
            if (req.file) {
                uploadFields.pictures = `/publicSequrityPictures/${req.file.filename}`;
            }

            try {
                const existingSequrity = await Sequrity.findOne({ 'sequrityId': sequrityId });
                if (!existingSequrity) {
                    return res.status(404).json({ success: false, message: 'Sequrity not found' });
                }

                // Handle existing pictures deletion
                if (req.file && existingSequrity.pictures) {
                    const imagePath = path.join(__dirname, '../../Uploads/SequrityProfile', path.basename(existingSequrity.pictures));
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                        console.log(`Successfully deleted the old file: ${imagePath}`);
                    } else {
                        console.log(`File ${imagePath} doesn't exist.`);
                    }
                }

                // Update sequrity in database
                const updatedSequrity = await Sequrity.findOneAndUpdate(
                    { 'sequrityId': sequrityId },
                    { $set: uploadFields },
                    { new: true }
                );

                if (!updatedSequrity) {
                    return res.status(404).json({ success: false, message: 'Sequrity not found' });
                }

                res.status(200).json({ success: true, message: 'Sequrity updated successfully', data: updatedSequrity });
            } catch (error) {
                console.error('Error updating sequrity:', error);
                res.status(500).json({ success: false, message: 'Failed to update sequrity', error: error.message });
            }
        });
    } catch (error) {
        console.error('Unknown error:', error);
        res.status(500).json({ success: false, message: 'Unknown error', error: error.message });
    }
};


exports.deleteSequrityProfilePicture = async (req, res) => {
    try {
        const { id } = req.params;

        const sequrity = await Sequrity.findById(id);
        if (!sequrity) {
            return res.status(404).json({ success: false, message: 'Sequrity not found' });
        }

        // Check if there is a picture to delete
        if (sequrity.pictures) {
            const imagePath = path.join(__dirname, '../../Uploads/SequrityProfile', path.basename(sequrity.pictures));
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`Successfully deleted the file: ${imagePath}`);
                } catch (error) {
                    console.error(`Error deleting file ${imagePath}: ${error}`);
                }
            } else {
                console.log(`File ${imagePath} doesn't exist.`);
            }
        }

        // Delete the sequrity document from the database
        await Sequrity.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Sequrity profile deleted successfully' });

    } catch (error) {
        console.error('Error deleting sequrity profile picture and document:', error);
        res.status(500).json({ success: false, message: 'Failed to delete sequrity profile picture and document', error: error.message });
    }
};

exports.addAttendance = async (req, res) => {
    const { sequrityId } = req.params;
    const { date, status, checkInDateTime, checkOutDateTime } = req.body;

    try {
        const sequrity = await Sequrity.findOne({ sequrityId });

        if (!sequrity) {
            return res.status(404).json({ success: false, message: 'Sequrity not found' });
        }

        const attendanceRecord = {
            date,
            status,
            checkInDateTime,
            checkOutDateTime
        };

        sequrity.attendance.push(attendanceRecord);

        await sequrity.save();

        res.status(200).json({ success: true, message: 'Attendance added successfully', data: sequrity });
    } catch (error) {
        console.error('Error adding attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to add attendance', error: error.message });
    }
};