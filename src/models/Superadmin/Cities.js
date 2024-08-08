const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String }  
});

const Cities = mongoose.model('Cities', citySchema);

module.exports = Cities;
