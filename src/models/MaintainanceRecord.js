const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    name: {
        type: String,
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
        enum: ["Online", "Cash"]
    },
    transactionId: {
        type: String,
    },
    status: {
        type: String,
        required: true,
        enum: ["Paid", "UnPaid", "Confirm", "Pending"],
        default: "Pending"
    },
    amount: {
        type: String,
        required: true
    },
    paidAmount: {
        type: String,
    },
    payedOn: {
        type: Date,
    },
    pictures: {
        type: String
    },
});

const MaintainanceSchema = new mongoose.Schema({
    society: {
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SocietyAdmin",
            required: true,
        },
        monthAndYear: {
            type: String,
            required: true
        },
       paymentDetails: [PaymentSchema]
        
    }
}, { timestamps: true });

module.exports = mongoose.model("Maintainance", MaintainanceSchema);
