const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    winner: {
        type: String
    }
});

const registrationSchema = new mongoose.Schema({
    participantId: {
        type: String,
        required: true
    },
    participantName: {
        type: String,
        required: true
    },
    activity: {
        type: [String], 
        required: true
    }
    
});

const eventSchema = new mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SocietyAdmin",
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    pictures: [{
        img: {
            type: String
        }
    }],
    activities: [activitySchema],
    registrations: [registrationSchema]
}, { timestamps: true });

module.exports = mongoose.model("Events", eventSchema);