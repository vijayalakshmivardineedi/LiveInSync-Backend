const { default: mongoose } = require("mongoose")
const mongose = require("mongoose")

const NotificationSchema = new mongose.Schema({
    Category: {
        type: String,
    },
    SenderName: {
        type: String,
    },
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "society",
        required: false
    },
    NotiFyStatus: {
        type: String,
        default: "unread",
        enum: ["unread", "read"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

})
const notifyModel = mongoose.model("Notification", NotificationSchema)
module.exports = notifyModel