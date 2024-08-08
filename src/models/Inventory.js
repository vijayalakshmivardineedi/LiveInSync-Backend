const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    image: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    }
});
module.exports = mongoose.model('Inventory', inventorySchema);