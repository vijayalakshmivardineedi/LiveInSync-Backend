const Features = require("../models/Features");


exports.createFeature = async(req, res) => {
    const {feature} = req.body;
    try {
        const newFeature = new Features({
            feature  })
        await newFeature.save();
        return res.status(200).json({success: true, message: "Successfully feature Created"});
    } catch (error) {
        return res.status(400).json({success: false, error: error}) 
    }
}

exports.getFeatures = async(req, res) => {
    try {
        const features = await Features.find();
        if(!features){
            return res.status(401).json({success: false, message: "No Features Found"})
        }
        return res.status(201).json({success: true, Features: features})
    } catch (error) {
        return res.status(404).json({success: false, error: error})
    } 
}

exports.getFeatureById = async(req, res) => {
    const {id} = req.params;
    try {
        const feature = await Features.findOne({_id: id});
        if(!feature){
            return res.status(401).json({success: false, message: "No Feature Found"})
        }
        return res.status(201).json({success: true, Features: feature})
    } catch (error) {
        return res.status(404).json({success: false, error: error})
    } 
}

exports.updateFeaturesById = async(req, res) => {
    const {id} = req.params;

    const uploadFields = { ...req.body };
    console.log(uploadFields)
    delete uploadFields.id;

    try {
        const updatedFeature = await Features.findByIdAndUpdate(id, { $set: uploadFields }, { new: true });
        if(!updatedFeature){
            return res.status(404).json({success: false, message: "Not Found"}) 
        }
        return res.status(201).json({success: true, message: "Feature Successfully Updated", Features:updatedFeature})
    } catch (error) {
        return res.status(404).json({success: false, error: error})
    } 
}

exports.deleteFeaturesById = async(req, res) => {
    const {id} = req.params;
    
    try {
        const deleteFeature = await Features.findByIdAndDelete(id);
        console.log(deleteFeature)
        if(!deleteFeature){
            return res.status(404).json({success: false, message: "Not Found"}) 
        }
        return res.status(201).json({success: true, message: "Feature Successfully Deleted"})
    } catch (error) {
        return res.status(404).json({success: false, error: error})
    } 
}
