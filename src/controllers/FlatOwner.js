const FlatOwnerModel = require("../models/FlatOwner")

exports.AddFlatOwnerDetails = async (req, res) => {
    const { societyId, OwnerName, BlockNo, FlatOn, Status, FlatSize, FlatType } = req.body
    try {
        const NewUpadate = new FlatOwnerModel({
            societyId,
            OwnerName,
            BlockNo,
            FlatOn,
            Status,
            FlatSize,
            FlatType
        })
        const saved = await NewUpadate.save()
        res.status(201).json({success: true, message: "Successfully Added" })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// exports.GetDetailsofFlatOwnerById = async (req, res) => {
//     const { OwnerId } = req.params
//     try {
//         const NewUpadate = FlatOwnerModel.find({ _id: OwnerId })
//         if (!NewUpadate) {
//             res.status(404).json({ message: "Owner Id not found" });
//         }
//         res.status(201).json({
//             data: NewUpadate
//         })
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// }

// exports.GetDetailsofAllFlatOwners = async (req, res) => {
//     try {
//         const NewUpadate = FlatOwnerModel.find()
//         if (!NewUpadate) {
//             res.status(404).json({ message: "Data not found" });
//         }
//         res.status(201).json({
//             data: NewUpadate
//         })
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// }

exports.getBySocietyId = async (req, res) => {
    const { societyId } = req.params;
    try {
        const flatOwner = await FlatOwnerModel.find({ societyId });
        if (!flatOwner) {
            return res.status(404).json({ success: false, message: 'No flat owner found for the given societyId' });
        }
        res.status(200).json({ success: true, flatOwner });
    } catch (error) {
        console.error('Error retrieving flat owner:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

exports.getBySocietyIdAndUserId = async (req, res) => {
    const { societyId, id } = req.params;

    try {
        const flatOwner = await FlatOwnerModel.find({ societyId, _id: id }); // Adjust query to include userId
        if (!flatOwner || flatOwner.length === 0) {
            return res.status(404).json({ success: false, message: 'No flat owner found for the given societyId and userId' });
        }
        res.status(200).json({ success: true, flatOwner });
    } catch (error) {
        console.error('Error retrieving flat owner:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

exports.UpdateFlatOwnerDetails = async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
        const updatedFlatOwner = await FlatOwnerModel.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedFlatOwner) {
            return res.status(404).json({ success: false, message: 'Flat owner not found' });
        }
        res.status(200).json({ success: true, message: "Flat Owner Successfully Updated " });
    } catch (error) {
        console.error('Error updating flat owner:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

exports.DeleteFlatOwnerDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedFlatOwner = await FlatOwnerModel.findByIdAndDelete(id);

        if (!deletedFlatOwner) {
            return res.status(404).json({ success: false, message: 'Flat owner not found' });
        }

        res.status(200).json({ success: true, message: 'Flat Owner Deleted Successfully' });
    } catch (error) {
        console.error('Error deleting flat owner:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};