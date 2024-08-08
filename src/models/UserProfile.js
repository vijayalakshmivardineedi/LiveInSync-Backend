// const mongoose = require('mongoose');

// const UserProfileSchema = new mongoose.Schema({
//     userId: {
//         type: String,
//         required: true,
//     },
//     societyId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "SocietyAdmin",
//         required: true,
//     },
//     userType: {
//         type: String,
//         enum: ["Owner", "Tendent", "Bachelor"]
//     },
//     name: { 
//         type: String,
//         required: true,
//     },
//     email: { 
//         type: String, 
//         required: true, 
//         unique: true 
//     },
//     mobileNumber: {
//         type: String,
//         required: true,
//     },
//     gender: {
//         type: String,
//         enum: ["Female", "Male", "Others"]
//     },
//     societyName: {
//         type: String,
//     },
//     buildingName: {
//         type: String,
//     },
//     flatNumber: {
//         type: String
//     },
//     isVerified: {
//         type : Boolean,
//         default : false
//     },
//     status : {
//         type: String,
//         enum: ["Current", "MoveIn"]
//     },
//     profilePicture: {
//         type: String, 
//     },
//     familyMembers: [{
//         name: String,
//         age: Number,
//         gender: { type: String, enum: ["Female", "Male", "Others"]},
//         mobileNumber: String,
//     }],
//     pets: [{
//         petType: String,
//         petName: String,
//         age: Number
//     }],
// },{timestamps: true});

// module.exports = mongoose.model('UserProfile', UserProfileSchema);



const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const UserProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "society",
    },
    userType: {
        type: String,
        enum: ["Owner", "Tendent", "Bachelor"]
    },
    name: { 
        type: String,
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    mobileNumber: {
        type: String,
    },
    role: {
        type: String,
        required: true,
        default: "User"
    },
    gender: {
        type: String,
        enum: ["Female", "Male", "Others"]
    },
    societyName: {
        type: String,
    },
    hash_password: {
        type: String,
    },
    buildingName: {
        type: String,
    },
    flatNumber: {
        type: String
    },
    isVerified: {
        type : Boolean,
        default : false
    },
    status : {
        type: String,
        enum: ["Current", "MoveIn"]
    },
    profilePicture: {
        type: String, 
    },
    familyMembers: [{
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Female", "Male", "Others"]
        },
        Relation: {
            type: String,
            required: true,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
    }], 
    Vehicle: [{
        brand: {
            type: String,
            required: true,
        },
        modelName: {
            type: String,
            required: true,
        },
        vehicleNumber: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["Bike", "Car", "Others"],
            required: true,
        },
        driverName: {
            type: String,
        },
        mobileNumber: {
            type: String,
        },
    }],
    pets: [{
        petType: {
            type: String,
            required: true,
            enum: ['Dog', 'Cat', 'Bird', 'Hamster', 'Rabbit', 'Other']
        },
        petName: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        breed: {
            type: String,
            required: false
        },
        gender: {
            type: String,
            enum: ['Male', 'Female'],
            required: false
        },
    }],
}, {timestamps: true});

UserProfileSchema.methods = {
    authenticate: async function (password) {
        return await bcrypt.compare(password, this.hash_password);
    },
};

UserProfileSchema.virtual("password").set(function (password) {
    this.hash_password = bcrypt.hashSync(password, saltRounds);
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);