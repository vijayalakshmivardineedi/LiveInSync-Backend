const mongoose = require('mongoose');

const AmenitySchema = new mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "SocietyAdmin"
    },
    image: {
        type: String,
    },
    amenityName: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
    },
    timings: {
        type: String,
    },
    location: {
        type: String,
    },
    cost: {
        type: String,
    },
    chargePer: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Available', 'Booked'],
        default: 'Available',
        required: true
    },
    list: [
        {
            userId: {
                type: String,
                required: true,
            },
            bookedDate: {
                type: Date,
                required: true
            },
            dateOfBooking: {
                type: Date,
                required: true
            },
            payed: {
                type: String,
                required: true
            },
            pending: {
                type: String,
            },
            status: {
                type: String,
                required: true,
                enum:["InProgress", "Completed", "Cancelled"],
                default: "InProgress"
            }
        }
    ]
});

module.exports = mongoose.model("Amenity", AmenitySchema);