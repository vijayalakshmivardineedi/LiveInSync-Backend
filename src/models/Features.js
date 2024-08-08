const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
  feature:{
    type: String,
    require: true
  },
  price:{
    type: String,
  }
},{timestamps: true})

module.exports = mongoose.model('Features', FeatureSchema);