const multer = require("multer");
const fs = require('fs');
const path = require('path');
const shortid = require("shortid");
const Events = require("../models/Events");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, "../Uploads/Events");
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
    { name: "pictures", maxCount: 5 }
]);

// Create a new event
exports.createEvent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        try {
            const { societyId, name, startDate, endDate, activities } = req.body;
            let pictures = [];

            if (req.files && req.files['pictures'] && req.files['pictures'].length > 0) {
                pictures = req.files['pictures'].map(image => ({
                    img: `/publicEvents/${image.filename}`
                }));
            }

            const event = new Events({
                societyId,
                name,
                startDate,
                endDate,
                pictures,
                activities: activities ? JSON.parse(activities) : []
            });

            await event.save();
            return res.status(201).json({success: true, message: "Successfully Event Created"});
        } catch (error) {
            console.log(error);
            res.status(400).json({ error: error.message });
        }
    });
};


// Register for an event
exports.register = async (req, res) => {
    try {
        const { id } = req.params;
        const { societyId, participantId, participantName, activities } = req.body;
console.log(id, societyId, participantId, participantName, activities)
        // Find the event by its id and societyId
        const event = await Events.findOne({
            "_id": id,
            "societyId": societyId,
          });

        if (!event) {
            return res.status(404).json({ error: "Event not found !!!" });
        }

        const registration = {
            participantId,
            participantName,
            activity: Array.isArray(activities) ? activities : [activities]
        };

        event.registrations.push(registration);
        await event.save();
        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};
exports.getAllEvents = async (req, res) => {
    const { societyId } = req.params;
    try {
        const events = await Events.find({ societyId });
        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error(error);  // Debug log
        res.status(500).json({ error: error.message });
    }
};



// Get a single event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id, societyId } = req.params;

        // Find the event by both _id and societyId
        const event = await Events.findOne({ _id: id, societyId });

        if (!event) {
            return res.status(404).json({ error: "Event not found or societyId does not match" });
        }

        res.status(200).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
    try {
        // Handle file uploads
        upload(req, res, async (error) => {
            if (error) {
                return res.status(301).json({ success: false, message: "Error in Uploading files:", error });
            }

            const { societyId, id } = req.params;
            const { activities, ...uploadFields } = req.body; // Ensure activities are separated from uploadFields

            try {
                // Verify the event exists and matches the societyId
                const event = await Events.findOne({ _id: id, societyId });
                if (!event) {
                    return res.status(404).json({ success: false, message: "Event not found or societyId does not match" });
                }

                // Handle activities update (if needed)
                if (activities) {
                    uploadFields.activities = JSON.parse(activities); // Parse activities string into array of objects
                }

                // Handle pictures update
                let pictures = [];
                if (req.files['pictures'] && req.files['pictures'].length > 0) {
                    pictures = req.files['pictures'].map(image => ({
                        img: `/publicEvents/${image.filename}`, // Adjust path here as needed
                        originalname: image.originalname // Include original file name if needed
                    }));

                    // Remove old pictures from disk
                    event.pictures.forEach(picture => {
                        const imagePath = path.join(__dirname, '../Uploads/Events', path.basename(picture.img));
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        } else {
                            console.log(`File ${imagePath} doesn't exist.`);
                        }
                    });

                    // Update pictures in uploadFields
                    if (pictures.length > 0) {
                        uploadFields.pictures = pictures;
                    }
                }

                // Perform the update
                const updatedEvent = await Events.findByIdAndUpdate(id, { $set: uploadFields }, { new: true });

                res.status(200).json({ success: true, message: "Successfully Updated" });
            } catch (error) {
                console.error("Error updating event:", error);
                res.status(500).json({ success: false, message: "Failed to update event", error });
            }
        });
    } catch (error) {
        console.error("Error handling file upload:", error);
        res.status(500).json({ success: false, message: "Failed to handle file upload", error });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id, societyId } = req.params;

        // Find the event by its id and societyId
        const event = await Events.findOne({ _id: id, societyId });

        if (!event) {
            return res.status(404).json({ error: "Event not found or societyId does not match" });
        }

        // Delete event pictures from the filesystem
        if (event.pictures && event.pictures.length > 0) {
            await Promise.all(event.pictures.map(async (picture) => {
                const imagePath = path.join(__dirname, '../Uploads/Events', path.basename(picture.img));
                if (fs.existsSync(imagePath)) {
                    try {
                        fs.unlinkSync(imagePath);
                    } catch (error) {
                        console.error(`Error deleting event picture: ${error}`);
                    }
                }
            }));
        }

        // Delete the event document from the database
        await Events.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Event Deleted Successfully" });

    } catch (error) {
        console.error(`Error deleting event: ${error}`);
        return res.status(500).json({ error: error.message });
    }
};