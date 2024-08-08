const mongoose = require("mongoose")

const DocumentsSchema = new mongoose.Schema({
    societyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SocietyAdmin",
        require: true
    },
   name: {
        type: String,
        require: true
    },
   documentTitle: {
        type: String,
        require: true
    },
    blockNumber: {
        type: String,
        require: true,
    },
    flatNumber: {
        type: String,
        require: true,
    },
    pictures: {
        type: String, 
    },

}, { timestamps: true })

module.exports = mongoose.model("Document", DocumentsSchema);