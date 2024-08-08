const mongoose = require('mongoose');
const SocietyAdmin = require('../models/Authentication/SocietyAdmin');
const Maintainance = require('../models/MaintainanceRecord');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shortid = require('shortid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const destinationPath = path.join(__dirname, '../Uploads/Maintainance');
      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
      }
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      cb(null, shortid.generate() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage }).single('pictures');


  exports.createMaintenanceRecords = async (req, res) => {
    try {
        const { societyId, monthAndYear, amount } = req.body;
        const society = await SocietyAdmin.findById(societyId);

        if (!society) {
            return res.status(404).json({ success: false, message: 'Society not found' });
        }

        const { blocks = [] } = society;

        // Create new payment details based on the blocks and flats
        const newPaymentDetails = blocks.flatMap(block =>
            block.flats.map(flat => ({
                blockno: block.blockName,
                flatno: flat.flatNumber || 'Unknown Flat',
                amount: amount,
                status: "UnPaid"
            }))
        );

        // Find existing maintenance record by societyId and monthAndYear
        let maintenance = await Maintainance.findOne({
            'society.societyId': societyId,
            'society.monthAndYear': monthAndYear
        });

        if (maintenance) {
            // If record exists, update paymentDetails
            maintenance.society.paymentDetails = newPaymentDetails;
        } else {
            // If no record exists, create a new one
            maintenance = new Maintainance({
                society: {
                    societyId: societyId,
                    monthAndYear: monthAndYear,
                    paymentDetails: newPaymentDetails
                }
            });
        }

        // Save the record (either updated or new)
        await maintenance.save();
        res.status(200).json({ success: true, message: 'Maintenance Record Created / Updated Successfully', data: maintenance });
    } catch (error) {
        console.error('Error creating maintenance records:', error);
        res.status(500).json({ success: false, message: 'Failed to create/update maintenance records', error: error.message });
    }
};

exports.getByMonthAndYear = async (req, res) => {
    try {
        const { societyId, monthAndYear } = req.params;

        if (!societyId || !monthAndYear) {
            return res.status(400).json({ success: false, message: 'Society ID and monthAndYear are required' });
        }

        // Fetch Maintenance Records
        const maintenance = await Maintainance.findOne({
            'society.societyId': societyId,
            'society.monthAndYear': monthAndYear
        });

        if (!maintenance) {
            return res.status(404).json({ success: false, message: 'No maintenance records found for the given month and year' });
        }

        res.status(200).json({ success: true, maintenance });
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch maintenance records', error: error.message });
    }
};

exports.updatePaymentDetails = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error uploading file' });
            }

            try {
                const { societyId, blockno, flatno, transactionType, transactionId, status, paidAmount, monthAndYear, userId, name } = req.body;
                const newPictures = req.file ? `/publicMaintainance/${req.file.filename}` : null;

                if (!societyId || !blockno || !flatno || !paidAmount || !monthAndYear) {
                    return res.status(400).json({ success: false, message: 'Required fields are missing' });
                }

                let maintenance = await Maintainance.findOne({
                    'society.societyId': societyId,
                    'society.monthAndYear': monthAndYear
                });

                if (!maintenance) {
                    return res.status(404).json({ success: false, message: 'Society maintenance record not found' });
                }

                const existingPayment = maintenance.society.paymentDetails.find(record => 
                    record.blockno === blockno && 
                    record.flatno === flatno
                );

                if (existingPayment) {
                    // Handle picture update
                    if (newPictures) {
                        // Delete the old picture if there's a new one
                        if (existingPayment.pictures) {
                            const oldFilePath = path.join(__dirname, '../Uploads/Maintainance', existingPayment.pictures.split('/').pop());
                            fs.unlink(oldFilePath, (unlinkErr) => {
                                if (unlinkErr) {
                                    console.error('Error deleting old picture file:', unlinkErr);
                                }
                            });
                        }
                        existingPayment.pictures = newPictures;
                    }

                    // Update existing record with fields from the request body
                    existingPayment.userId = userId || existingPayment.userId;
                    existingPayment.name = name || existingPayment.name;
                    existingPayment.transactionType = transactionType || existingPayment.transactionType;
                    existingPayment.transactionId = transactionId || existingPayment.transactionId;
                    existingPayment.status = status || existingPayment.status;
                    existingPayment.paidAmount = paidAmount || existingPayment.paidAmount;
                    existingPayment.payedOn = Date.now(); // Update payedOn to current time

                } else {
                    // Add new payment record if it does not exist
                    maintenance.society.paymentDetails.push({
                        userId: userId || null,
                        name: name || null,
                        blockno,
                        flatno,
                        transactionType: transactionType || null,
                        transactionId: transactionId || null,
                        status: status || null,
                        paidAmount: paidAmount || null,
                        payedOn: Date.now(),
                        pictures: newPictures || null
                    });
                }

                await maintenance.save();

                res.status(200).json({ success: true, message: 'Payment details updated successfully', data: maintenance });
            } catch (error) {
                console.error('Error updating payment details:', error);
                res.status(500).json({ success: false, message: 'Failed to update payment details', error: error.message });
            }
        });
    } catch (error) {
        console.error('Error in updatePaymentDetails function:', error);
        res.status(500).json({ success: false, message: 'Error in updating payment details' });
    }
};


exports.getPaymentsBySocietyBlockFlat = async (req, res) => {
    try {
        const { societyId, blockno, flatno } = req.params;

        if (!societyId || !blockno || !flatno) {
            return res.status(400).json({ success: false, message: 'Society ID, block number, and flat number are required' });
        }

        const maintenanceRecords = await Maintainance.find({
            'society.societyId': societyId
        });

        if (!maintenanceRecords || maintenanceRecords.length === 0) {
            return res.status(404).json({ success: false, message: 'No maintenance records found for the given society ID' });
        }

        const payments = maintenanceRecords.flatMap(record => 
            record.society.paymentDetails.filter(detail =>
                detail.blockno === blockno &&
                detail.flatno === flatno
            )
        );

        if (payments.length === 0) {
            return res.status(404).json({ success: false, message: 'No payment details found for the given block and flat' });
        }

        res.status(200).json({ success: true, payments });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payment details', error: error.message });
    }
};

exports.getPaymentsBySocietyBlockFlatMonthAndYear = async (req, res) => {
    try {
        const { societyId, blockno, flatno, monthAndYear } = req.params;

        if (!societyId || !blockno || !flatno || !monthAndYear) {
            return res.status(400).json({ success: false, message: 'Society ID, block number, flat number, and month and year are required' });
        }

        const maintenanceRecord = await Maintainance.findOne({
            'society.societyId': societyId,
            'society.monthAndYear': monthAndYear
        });

        if (!maintenanceRecord) {
            return res.status(404).json({ success: false, message: 'Not found for society ID and month and year' });
        }

        const maintanance = maintenanceRecord.society.paymentDetails.find(detail =>
            detail.blockno === blockno &&
            detail.flatno === flatno
        );
        if (!maintanance) {
            return res.status(404).json({ success: false, message: 'No payment details found for the given block and flat' });
        }
        res.status(200).json({ success: true, maintanance });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payment details', error: error.message });
    }
};



exports.updatePaymentStatus = async (req, res) => {
    try {
        const { societyId, blockno, flatno, monthAndYear, status } = req.body;

        if (!societyId || !blockno || !flatno || !monthAndYear || !status) {
            return res.status(400).json({ success: false, message: 'Required fields are missing' });
        }

        const maintenance = await Maintainance.findOne({
            'society.societyId': societyId,
            'society.monthAndYear': monthAndYear
        });

        if (!maintenance) {
            return res.status(404).json({ success: false, message: 'Maintenance record not found' });
        }

        const paymentRecord = maintenance.society.paymentDetails.find(record =>
            record.blockno === blockno &&
            record.flatno === flatno
        );

        if (!paymentRecord) {
            return res.status(404).json({ success: false, message: 'Payment detail not found' });
        }

        paymentRecord.status = status;

        await maintenance.save();

        res.status(200).json({ success: true, message: 'Payment Status Updated Successfully', data: paymentRecord });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ success: false, message: 'Failed to update payment status', error: error.message });
    }
};

exports.getAllMonthsBySocietyId = async (req, res) => {
    try {
        const { societyId } = req.params;

        if (!societyId) {
            return res.status(400).json({ success: false, message: 'Society ID is required' });
        }

        // Fetch all maintenance records for the given societyId
        const maintenanceRecords = await Maintainance.find({
            'society.societyId': societyId
        });

        if (!maintenanceRecords || maintenanceRecords.length === 0) {
            return res.status(404).json({ success: false, message: 'No maintenance records found for the given society ID' });
        }

        // Extract distinct months and years from the records
        const monthsData = maintenanceRecords.map(record => ({
            monthAndYear: record.society.monthAndYear,
            paymentDetails: record.society.paymentDetails
        }));

        res.status(200).json({ success: true, maintanance: monthsData });
    } catch (error) {
        console.error('Error fetching all months data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch all months data', error: error.message });
    }
};
