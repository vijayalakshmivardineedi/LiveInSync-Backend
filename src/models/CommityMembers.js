const mongoose = require("mongoose")

const CommityMembersSchema = new mongoose.Schema({
    societyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SocietyAdmin",
        require: true
    },
   name: {
        type: String,
        require: true
    },
   email: {
        type: String,
        require: true
    },
    role: {
        type: String,
        require: true,
        enum:["CommityMember"]
    },
    designation: {
        type: String,
        require: true,
    },
    phoneNumber: {
        type: String,
        require: true,
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

module.exports = mongoose.model("CommityMembers", CommityMembersSchema);