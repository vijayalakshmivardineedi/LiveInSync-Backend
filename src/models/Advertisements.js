// const mongoose = require ('mongoose');

// const advertisementSchema = new mongoose.Schema({
//     userId: {
//         type: String,
//         // type: mongoose.Schema.Types.ObjectId,
//         // ref: 'User',
//         required: true
//     },
//     adv: {
//         type: String,
//         enum: ["Sale", "Rent"],
//         default: "Rent",
//         require: true,
//     },
//     details: [{
//         block: String,
//         flat_No: String,
//         flat_Area: String,
//         rooms: String,
//         washrooms: String,
//         price: String,
//         maintainancePrice: String,
//     }],
//     pictures: [{
//         img: {
//             type: String,
//             require: true
//         }
//     }]    

// },{timestamps: true})

// module.exports = mongoose.model ('Advertisements', advertisementSchema)
const mongoose = require ('mongoose');

const advertisementSchema = new mongoose.Schema({
    societyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SocietyAdmin",
        require: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    adv: {
        type: String,
        enum: ["Sale", "Rent"],
        default: "Rent",
        require: true,
    },
    status: {
        type: String,
        enum: ["Occupied", "Unoccupied"],
        default: "Unoccupied",
        require: true,
    },
    details: {
        block: String,
        flat_No: String,
        flat_Area: String,
        rooms: String,
        washrooms: String,
        price: String,
        maintainancePrice: String,
    },
    pictures: [{
        img: {
            type: String,
            require: true
        }
    }]    

},{timestamps: true})

module.exports = mongoose.model ('Advertisements', advertisementSchema)