const mongoose = require('mongoose');

const QrCodeSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('QrCode', QrCodeSchema);
