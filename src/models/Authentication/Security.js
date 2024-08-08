// const mongoose = require("mongoose");

// const sequritySchema = new mongoose.Schema({
//         societyId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "SocietyAdmin",
//             required: true,
//         },
//             sequrityId: {
//                 type: String,
//                 required: true,
//                 unique: true
//             },
//             name: {
//                 type: String,
//                 required: true,
//             },
//             phoneNumber: {
//                 type: String,
//                 required: true,
//                 unique: true
//             },
//             role: {
//                 type: String,
//                 enum:["Sequrity"],
//                 default: "Sequrity",
//                 required: true,
//             },
//             details: {
//                 type: String,
//             },
//             aadharNumber: {
//                 type: Number,
//                 require: true,
//                 unique: true,
//             },
//             address: {
//                 addressLine1: {
//                     type: String,
//                     required: true,
//                 },
//                 addressLine2: {
//                     type: String,
//                     required: true,
//                 },
//                 state: {
//                     type: String,
//                     required: true,
//                 },
//                 postalCode: {
//                     type: String,
//                     required: true,
//                 },
//             },
//             attendance: [{
//                 date: {
//                     type: Date,
//                 },
//                 status: {
//                     type: String,
//                     enum: ['present', 'absent', 'leave'],
//                     default: 'absent',
//                 },
//                 checkInDateTime: {
//                     type: Date,
//                 },
//                 checkOutDateTime: {
//                     type: Date,
//                 },
//             }],
//             pictures: {
//                 type: String,
//             },
        
// });

// module.exports = mongoose.model("Sequrity", sequritySchema);


const mongoose = require("mongoose");

const sequritySchema = new mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Societys",
        required: true,
    },
    sequrityId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    hash_password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["Sequrity"],
        default: "Sequrity",
        required: true,
    },
    details: {
        type: String,
    },
    aadharNumber: {
        type: Number,
        require: true,
        unique: true,
    },
    address: {
        addressLine1: {
            type: String,
            required: true,
        },
        addressLine2: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
    },
    attendance: [{
        date: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'leave'],
            default: 'absent',
        },
        checkInDateTime: {
            type: Date,
        },
        checkOutDateTime: {
            type: Date,
        },
    }],
    pictures: {
        type: String,
    },

});
sequritySchema.methods = {
    authenticate: async function (password) {
        return await bcrypt.compare(password, this.hash_password);
    },
};
sequritySchema.virtual("password").set(function (password) {
    // Hash the password with the defined salt rounds
    this.hash_password = bcrypt.hashSync(password, saltRounds);
});

module.exports = mongoose.model("Sequrity", sequritySchema);