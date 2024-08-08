const VisitorStaff = require('../models/VisitorsServices');
const Services = require('../models/Services');

exports.checkInStaff = async (req, res) => {
    try {
        const { societyId, userid } = req.body;

        // Verify QR code validity
        const serviceTypes = ['maid', 'milkMan', 'cook', 'paperBoy', 'driver', 'water', 'plumber', 'carpenter', 'electrician', 'painter', 'moving', 'mechanic', 'appliance', 'pestClean'];

        // Check if the user is already checked in
        const existingCheckIn = await VisitorStaff.findOne({
            'society.societyId': societyId,
            'society.staff.userId': userid,
            'society.staff.checkOutDateTime': { $exists: false }  // Assuming you have a checkOutDateTime field
        });

        if (existingCheckIn) {
            return res.status(400).json({ success: false, message: 'User is already checked in and must check out before checking in again' });
        }

        // Iterate through each service type to find matching qrImages
        let checkInRecord;
        for (let serviceType of serviceTypes) {
            const serviceProvider = await Services.findOne({
                'society.societyId': societyId,
                [`society.${serviceType}.userid`]: userid
            });

            if (serviceProvider) {
                // Prepare check-in record
                checkInRecord = {
                    serviceType,
                    userId: req.body.userid,
                    inGateNumber: req.body.inGateNumber,
                    inVehicleNumber: req.body.inVehicleNumber,
                    serviceProvider: serviceProvider._id,
                    checkInDateTime: new Date() // Add a check-in timestamp
                };

                // Update the visitor staff collection
                await VisitorStaff.findOneAndUpdate(
                    { 'society.societyId': societyId },
                    { $push: { 'society.staff': checkInRecord } },
                    { new: true, upsert: true }
                );

                break; // Exit loop once a match is found
            }
        }

        if (!checkInRecord) {
            return res.status(404).json({ success: false, message: 'UserId not found or invalid for any service type' });
        }

        res.status(200).json({ success: true, message: 'Staff checked in successfully', checkInRecord });
    } catch (error) {
        console.error('Error checking in staff:', error);
        res.status(500).json({ success: false, message: 'Error checking in staff', error: error.message });
    }
};

exports.checkOutStaff = async (req, res) => {
    try {
      const { societyId, visitorId, outGateNumber, outVehicleNumber } = req.body;
  
      // Find the visitor staff record by societyId
      const visitorStaff = await VisitorStaff.findOne({ 'society.societyId': societyId });
  
      // If no visitor staff record is found, return 404
      if (!visitorStaff) {
        return res.status(404).json({ success: false, message: 'Society not found or no staff records' });
      }
  
      // Find the index of the staff member by visitorId
      const staffIndex = visitorStaff.society.staff.findIndex(staff => staff.visitorId === visitorId);
  
      // If no staff member is found, return 404
      if (staffIndex === -1) {
        return res.status(404).json({ success: false, message: 'Staff member not found or already checked out' });
      }
  
      // Update the staff member's checkOutDateTime, outGateNumber, and outVehicleNumber
      visitorStaff.society.staff[staffIndex].checkOutDateTime = new Date();
      visitorStaff.society.staff[staffIndex].outGateNumber = outGateNumber;
      visitorStaff.society.staff[staffIndex].outVehicleNumber = outVehicleNumber;
  
      // Save the updated visitor staff record
      await visitorStaff.save();
  
      res.status(200).json({ success: true, message: 'Staff checked out successfully' });
    } catch (error) {
      console.error('Error checking out staff:', error);
      res.status(500).json({ success: false, message: 'Error checking out staff', error: error.message });
    }
  };
  
