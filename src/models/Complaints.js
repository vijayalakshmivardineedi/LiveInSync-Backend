const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "SocietyAdmin"
    },
    userId: {
        type: String,
        required: true,
        ref: "UserProfile"
    },
    complaintId: {
        type: String,
        required: true,
        unique: true
    },
    complaintCategory: {
        type: String,
        required: true
    },
    complaintType: {
        type: String,
        enum: ['Personal', 'Society'],
        required: true
    },
    complaintTitle: {
        type: String,
        required: true
    },
    complaintBy: {
        type: String,
        required: true
    },
    dateAndTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    resolution: {
        type: String,
        enum: ['Resolved', 'Unresolved', 'Pending']
    }
});

complaintSchema.pre('save', function(next) {
    this.complaintId = Math.floor(100000 + Math.random() * 900000).toString();
    next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
