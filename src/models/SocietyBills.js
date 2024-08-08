const mongoose = require('mongoose');

const societyBills = new mongoose.Schema({
    society: {
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SocietyAdmin",
            required: true,
        },
        bills: [{
            name: {
                type: String,
                required: true
            },
            status: {
                type: String,
                required: true,
                enum: ["Paid", "Unpaid"]
            },
            amount: {
                type: String,
                required: true
            },
            date: {
                type: String,
                required: true
            },
            pictures: { 
                    type: String
            },
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model("SocietyBills", societyBills);