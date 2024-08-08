
const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({

    
    plan: {
        type: String,
        require: true,
    },
    features: [{
        featureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Features",
            required: true,
        },
    }],

}, { timestamps: true });

module.exports = mongoose.model('Plans', PlanSchema)