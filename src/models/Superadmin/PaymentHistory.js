const mongoose=require("mongoose")


const paymentSchema=new mongoose.Schema({
    licenseId: {
        type: String,
        required: true,
    },
    societyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"society",
        required:true,
    },
    societyName: {
        type: String,
        required: true,
    },
    memberShip: {
        type: String,
        enum: ["Standard Plan", "Premium Plan", "Customized Plan"]
    },
    price: {
        type: String
    },
    activeStatus: {
        type: Boolean,
        enum: [true, false],
        default: true
    },
    paymentMethod: {
        type: String,
        enum: ["CASH", "CARD", "UPI","ONLINE", "NETBANKING"],
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        required: true,
        enum:["Pending","Completed","Failed"]
    },
    paymentDate: {
        type: Date,
        default: Date.now(),
    },
    startDate: {
        type: String
    },
    expiryDate: {
        type: String
    },
    isRenewal:{
        type: Boolean,
        enum: [true, false],
    }
})

const SuperAdminPayments=mongoose.model("SupPayment",paymentSchema)
module.exports=SuperAdminPayments