const mongoose = require('mongoose');
const pollsSchema = new mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "society",
        required: true,
    },
    poll: {
        question: {
            type: String,
            required: true,
        },
        Description: {
            type: String,
            required: true,
        },
        options: [{
            type: String,
            required: true,
        }],
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        expDate: {
            type: Date,
            required: true,
            default: function() {
                const now = new Date();
                now.setDate(now.getDate() + 1); // Add one day to the current date
                return now;
            }
        },
        status: {
            type: Boolean,
            default: true,
        },
        pollType:{
            type:String,
            default:"Community"
        },
        votes: [{
            userId: {
                type: String,
            },
            selectedOption: {
                type: String,
            }
        }]
    },
   
}, {timestamps: true});
module.exports = mongoose.model('Polls', pollsSchema);