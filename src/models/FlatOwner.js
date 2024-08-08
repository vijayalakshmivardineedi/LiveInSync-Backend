const mongoose = require("mongoose")

const FlatOwnerDetailsSchema = new mongoose.Schema({
    societyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SocietyAdmin",
        require: true
    },
    OwnerName: {
        type: String,
        require: true
    },
    BlockNo: {
        type: String,
        require: true
    },
    FlatNo: {
        type: String,
        require: true
    },
    FlatSize: {
        type: String,
        require: true,
    },
    FlatType: {
        type: String,
        require: true,
        enum:["1BHK","2BHK","3BHK","4BHK",]
    },
    Status: {
        type: String,
        require: true,
        enum:["OCCUPIED","UNOCCUPIED"]
    },

}, { timestamps: true })

const FlatOwnerModel = mongoose.model("FlatOwner", FlatOwnerDetailsSchema);
module.exports = FlatOwnerModel;