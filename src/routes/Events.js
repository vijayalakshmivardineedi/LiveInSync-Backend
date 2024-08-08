const express = require("express");
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, register } = require("../controllers/Events");
const Events = require("../models/Events");

const router = express.Router();

// router.post("/createEvent", createEvent);
// router.post("/register/:id", register);
// router.get("/getAllEvents/:societyId", getAllEvents);
// router.get("/getEventById/:id/:societyId", getEventById);
// router.put("/updateEvent/:societyId/:id", updateEvent);
// router.delete("/deleteEvent/:id/:societyId", deleteEvent);

// module.exports = router;



const multer = require('multer');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
// Configure multer for file uploads
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
const upload = multer({ storage }).fields([{ name: 'pictures', maxCount: 5 }]);
module.exports = (io) => {
    // Create a new event
    router.post('/createEvent', (req, res) => {
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
                // Emit to all connected clients
                io.to(societyId).emit('newNotification', {
                    type: 'event',
                    message: `New event created: ${name}`,
                    event: event
                });
                res.status(201).json({event,message:"Event Created Successfully!!"});
            } catch (error) {
                console.log(error);
                res.status(400).json({ error: error.message });
            }
        });
    });
    // Additional routes
    router.post("/register/:id", register);
    router.get("/getAllEvents/:societyId", getAllEvents);
    router.get("/getEventById/:id/:societyId", getEventById);
    router.put("/updateEvent/:societyId/:id", updateEvent);
    router.delete("/deleteEvent/:id/:societyId", deleteEvent);
    return router;
};