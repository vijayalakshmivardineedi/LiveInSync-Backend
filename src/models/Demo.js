const mongoose = require("mongoose")


const DemoSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNumber: String,
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cities",
    },
    societyName: { type: String },
    createdAt: { type: Date, default: Date.now },
    DemoAproval: {
        type:Boolean,
        default:false
    },
    DemoPresented: {
        type:Boolean,
        default:false
    },
    demoPresentedDate: { type: Date },
})
const DemoRequest = mongoose.model('DemoRequest', DemoSchema)
module.exports = DemoRequest