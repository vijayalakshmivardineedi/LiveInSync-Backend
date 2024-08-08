const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  society: {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "Societys",
      ref: "Societys",
      required: true,
    },
    visitors: [{
      visitorId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      phoneNumber: {
        type: String,
        required: true
      },
      block: {
        type: String,
        required: true
      },
      flatNo: {
        type: String,
        required: true
      },
      role: {
        type: String,
        enum: ["Guest", "Delivary", "Service", "Cab", "Others"],
        default: "Guest",
        required: true
      },
      reason: {
        type: String,
      },
      details: {
        type: String,
      },
      checkInDateTime: {
        type: Date,
      },
      checkOutDateTime: {
        type: Date
      },
      inGateNumber: {
        type: String
      },
      outGateNumber: {
        type: String
      },
      isFrequent: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        enum: ['Waiting', 'Check In', 'Check Out', 'Approve'],
        required: true,
        default: "Waiting",
      },
      date: {
        type: String
      },
      inVehicleNumber: {
        type: String
      },
      outVehicleNumber: {
        type: String
      },
      company: {
        type: String
      },
      pictures: {
        type: String
      },
      qrImage: {
        type: String
      }
    }]
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);
