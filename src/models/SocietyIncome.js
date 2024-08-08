const mongoose = require('mongoose');

const societyIncome = new mongoose.Schema({
    society: {
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SocietyAdmin",
            required: true,
        },
        payments: [{
            userId:{
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            blockno: {
                type: String,
                required: true
            },
            flatno: {
                type: String,
                required: true
            },
            transactionType: {
                type: String,
                required: true,
                enum: ["Online", "Cash"]
            },
            transactionId: {
                type: String,
            },
            status: {
                type: String,
                required: true,
                enum: ["Pending", "Confirm"],
                default: "Pending"
            },
            amount: {
                type: String,
                required: true
            },
            monthAndYear: {
                type: String,
                required: true
            },
            payedOn: {
                type: Date,
                required: true
            },
            pictures: { 
                    type: String
            },
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model("SocietyIncome", societyIncome);