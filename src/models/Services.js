const mongoose = require('mongoose');

// Define individual schemas for each service type
const serviceSchema = new mongoose.Schema({
    society: {
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SocietyAdmin",
            required: true,
        },
        maid: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                timings: String,
                reviews: String,
                rating: Number,
            }]
        }],
        milkMan: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                liters: String,
                timings: String,
                reviews: String,
                rating: Number,
            }]
        }],
        cook: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                timings: String,
                reviews: String,
                rating: Number,
            }]
        }],
        paperBoy: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                timings: String,
                newsPaper: [{ type: String }],
                reviews: String,
                rating: Number,
            }]
        }],
        driver: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                timings: String,
                workType: [{ type: String, enum: ["Full Time", "Part Time"] }],
                reviews: String,
                rating: Number,
            }]
        }],
        water: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                timings: String,
                type: {
                    waterType: { type: String, enum: ["RO-Filter", "Mineral"] },
                    liters: String
                },
                reviews: String,
                rating: Number,
            }]
        }],




        plumber: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                reviews: String,
                rating: Number,
            }]
        }],
        carpenter: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                reviews: String,
                rating: Number,
            }]
        }],
        electrician: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                reviews: String,
                rating: Number,
            }]
        }],
        painter: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                reviews: String,
                rating: Number,
            }]
        }],
        moving: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                reviews: String,
                rating: Number,
            }]
        }],
        mechanic: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                reviews: String,
                rating: Number,
            }]
        }],
        appliance: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                reviews: String,
                rating: Number,
            }]
        }],
        pestClean: [{
            userid: { type: String, required: true },
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
            address: { type: String, required: true },
            timings: [{ type: String, required: true }],
            pictures: { type: String },
            qrImages: { type: String },
            list: [{
                userId: String,
                Block: String,
                flatNumber: Number,
                reviews: String,
                rating: Number,
            }]
        }],
    }
})

module.exports = mongoose.model('Services', serviceSchema);