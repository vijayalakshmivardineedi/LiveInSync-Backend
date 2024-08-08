// const mongoose = require("mongoose")
// const societyAdminSchema = new mongoose.Schema({
//     superAdminId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "SuperAdmin",
//         required: true,
//     },
//     licenseId: {
//         type: String,
//         required: true,
//     },
//     societyName: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     societyMobileNumber: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     societyImage: [{
//         type: String,
//     }],
//     city: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Cities",
//         required: true,
//     },
//     societyAdress: {
//         addressLine1: {
//             type: String,
//             required: true,
//         },
//         addressLine2: {
//             type: String,
//             required: true,
//         },
//         state: {
//             type: String,
//             required: true,
//         },
//         postalCode: {
//             type: Number,
//             required: true,
//         },
//     },
//     hash_password: {
//         type: String,
//         required: true,
//     },
//     role: {
//         type: String,
//         enum: ["SocietyAdmin"],
//         default: "SocietyAdmin",
//     },
//     blocks: [{
//         blockName: {
//             type: String,
//         },
//         flats: [{
//             flatNumber: {
//                 type: String,
//             },
//         }],
//     }],
//     gates: [{
//         type: String,
//     }],
//     memberShip: {
//         type: String,
//         enum: ["Standard Plan", "Premium Plan", "Customized Plan"]
//     },
//     selectedFeatures: [{ type: String }],
//     price: {
//         type: String
//     },
//     activeStatus: {
//         type: Boolean,
//         enum: [true, false],
//         default: true
//     },
//     paymentMethod: {
//         type: String,
//         enum: ["COD", "CARD", "UPI", "NETBANKING","ONLINE","CASH"],
//         required: true,
//     },
//     transactionId: {
//         type: String,
//         required: true,
//     },
//     startDate: {
//         type: String
//     },
//     expiryDate: {
//         type: String
//     },
// }, { timeStamps: true })
// societyAdminSchema.methods = {
//     authenticate: async function (password) {
//         return await bcrypt.compare(password, this.hash_password);
//     },
// };
// societyAdminSchema.virtual("password").set(function (password) {
//     // Hash the password with the defined salt rounds
//     this.hash_password = bcrypt.hashSync(password, saltRounds);
// });
// module.exports = mongoose.model("society", societyAdminSchema);



const mongoose = require("mongoose")
const societyAdminSchema = new mongoose.Schema({
    superAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SuperAdmin",
        required: true,
    },
    licenseId: {
        type: String,
        required: true,
    },
    societyName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    societyMobileNumber: {
        type: String,
        required: true,
        unique: true
    },
    societyImage: [{
        type: String,
    }],
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cities",
        required: true,
    },
    societyAdress: {
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
            type: Number,
            required: true,
        },
    },
    hash_password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["SocietyAdmin"],
        default: "SocietyAdmin",
    },
    blocks: [{
        blockName: {
            type: String,
        },
        flats: [{
            flatNumber: {
                type: String,
            },
        }],
    }],
    gates: [{
        type: String,
    }],
    memberShip: {
        type: String,
        enum: ["Standard Plan", "Premium Plan", "Customized Plan"]
    },
    selectedFeatures: [{ type: String }],
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
        enum: ["CASH", "CARD", "UPI", "NETBANKING"],
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["Pending", "Completed", "Failed"]
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
    isRenewal: {
        type: Boolean,
        default: false
    }
}, { timeStamps: true })
societyAdminSchema.methods = {
    authenticate: async function (password) {
        return await bcrypt.compare(password, this.hash_password);
    },
};
societyAdminSchema.virtual("password").set(function (password) {
    // Hash the password with the defined salt rounds
    this.hash_password = bcrypt.hashSync(password, saltRounds);
});
module.exports = mongoose.model("Societys", societyAdminSchema);