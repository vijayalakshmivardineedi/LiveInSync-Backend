const Complaint = require('../models/Complaints');

// Create a new complaint
exports.createComplaint = async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        newComplaint.complaintId = Math.floor(100000 + Math.random() * 900000).toString();
        await newComplaint.save();
        res.status(201).json({success:true, complaint: newComplaint});
    } catch (err) {
        res.status(400).json({success:false, message: err.message });
    }
};

// Get all complaints by societyId
exports.getAllComplaintsBySocietyId = async (req, res) => {
    const { societyId } = req.params;
    try {
        const complaints = await Complaint.find({ societyId });
        res.status(201).json({success:true,  Complaints: complaints});
    } catch (err) {
        res.status(500).json({success:false,  message: err.message });
    }
};

// Get a complaint by societyId and complaintId
exports.getComplaintBySocietyId = async (req, res) => {
    const { societyId, complaintId } = req.params;
    try {
        const complaint = await Complaint.findOne({ societyId, complaintId });
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.status(201).json({success:true,  Complaints: complaint});
    } catch (err) {
        res.status(500).json({ success:false, message: err.message });
    }
};

// Update a complaint by societyId and complaintId
exports.updateComplaint = async (req, res) => {
    const { societyId, complaintId } = req.params;
    try {
        const updatedComplaint = await Complaint.findOneAndUpdate(
            { societyId, complaintId },
            req.body,
            { new: true }
        );
        if (!updatedComplaint) {
            return res.status(404).json({success:true, message: 'Complaint not found' });
        }
        res.status(201).json({success:true,  Complaints: updatedComplaint});
    } catch (err) {
        res.status(400).json({ success:false, message: err.message });
    }
};

// Delete a complaint by societyId and complaintId
exports.deleteComplaint = async (req, res) => {
    const { societyId, complaintId } = req.params;
    try {
        const deletedComplaint = await Complaint.findOneAndDelete({ societyId, complaintId });
        if (!deletedComplaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.status(201).json({success:true,  message: 'Complaint deleted' });
    } catch (err) {
        res.status(500).json({ success:false,  message: err.message });
    }
};