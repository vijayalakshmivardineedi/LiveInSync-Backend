const mongoose = require('mongoose');

const visitorStaffSchema = new mongoose.Schema({
    society: {
        societyId: {
            type: String,
            required: true
        },
        staff: [{
            userId: {
                type: String,
                required: true
            },
            checkInDateTime: {
                type: Date,
                required: true,
                default: Date.now
            },
            checkOutDateTime: {
                type: Date
            },
            inVehicleNumber: {
                type: String
            },
            outVehicleNumber: {
                type: String
            },
            inGateNumber: {
                type: String
            },
            outGateNumber: {
                type: String
            },
            serviceProvider: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Services' // Reference to the Services model
            }
        }]
    }
});

module.exports = mongoose.model('VisitorStaff', visitorStaffSchema);
