const SocietyBills = require('../models/SocietyBills');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shortid = require('shortid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, '../Uploads/SocietyBills');
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

exports.createBill = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error uploading file' });
      }

      try {
        const { societyId, name, status, amount, date } = req.body; 
        let pictures = {};

        if (req.file) {
          pictures = `/publicSocietyBills/${req.file.filename}`;
        }

        // Check if the societyId exists
        const existingSociety = await SocietyBills.findOne({ 'society.societyId': societyId });

        if (existingSociety) {
          // Update the existing society with the new bill
          existingSociety.society.bills.push({
            name,
            status,
            amount,
            date,
            pictures: pictures
          });

          await existingSociety.save();
        } else {
          // Create a new society document
          const societyBill = new SocietyBills({
            society: {
              societyId,
              bills: [{ // Adding to the bills array
                name,
                status,
                amount,
                date,
                pictures: pictures
              }]
            }
          });

          await societyBill.save();
        }

        return res.status(201).json({ success: true, message: "Bill created successfully" });
      } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error}` });
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in creating bill" });
  }
};

exports.getBillsBySocietyId = async (req, res) => {
  const { societyId } = req.params;
  try {
    const bills = await SocietyBills.find({ 'society.societyId': societyId }, { 'society': 1, '_id': 0 });

    if (bills.length === 0) {
      return res.status(404).json({ success: false, message: "No bills found for this society" });
    }

    return res.status(200).json({ success: true, society: bills[0].society });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error: ${error}` });
  }
};



exports.getBillById = async (req, res) => {
  const { societyId, id } = req.params;
  try {
    const bill = await SocietyBills.findOne(
      { 
        'society.societyId': societyId,
        'society.bills._id': id 
      },
      { 
        'society.bills.$': 1 
      }
    );

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }
    
    return res.status(200).json({ success: true, bill: bill.society.bills[0] });
  } catch (error) {
    console.log(`Error: ${error}`);
    return res.status(500).json({ success: false, message: `Error: ${error}` });
  }
};



exports.editBill = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log("Error uploading file:", err);
        return res.status(500).json({ success: false, message: 'Error uploading file' });
      }

      try {
        const { id, societyId } = req.params;
        const { name, status, amount, date } = req.body;

        // Prepare fields to be updated
        const updateFields = { name, status, amount, date };

        if (req.file) {
          // Retrieve existing bill document
          const billDocument = await SocietyBills.findOne({ 
            'society.societyId': societyId,
            'society.bills._id': id 
          });

          if (billDocument) {
            const billItem = billDocument.society.bills.id(id);

            // Delete old image if it exists
            if (billItem.pictures) {
              const oldImagePath = path.join(__dirname, '../Uploads/SocietyBills', path.basename(billItem.pictures));
              if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
              }
            }

            // Update fields to include the new picture
            updateFields.pictures = `/publicSocietyBills/${req.file.filename}`;
          } else {
            return res.status(404).json({ success: false, message: "Bill not found for the provided societyId" });
          }
        }

        // Perform the update operation
        const updatedBill = await SocietyBills.findOneAndUpdate(
          { 
            'society.societyId': societyId,
            'society.bills._id': id 
          },
          { $set: { 'society.bills.$': updateFields } },
          { new: true }
        );

        if (updatedBill) {
          return res.status(200).json({ success: true, message: 'Bill updated successfully' });
        } else {
          return res.status(404).json({ success: false, message: 'Bill not found' });
        }
      } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(500).json({ success: false, message: `Error: ${error}` });
      }
    });
  } catch (error) {
    console.log(`Error: ${error}`);
    return res.status(500).json({ success: false, message: "Error in updating bill" });
  }
};



exports.deleteBill = async (req, res) => {
  try {
    const { societyId, id } = req.params;
    const bill = await SocietyBills.findOne({ 'society.societyId': societyId, 'society.bills._id': id });

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    // Delete image if exists
    const billItem = bill.society.bills.id(id);
    if (billItem.pictures) {
      const imagePath = path.join(__dirname, '../Uploads/SocietyBills', path.basename(billItem.pictures));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove the bill from the society's bills array
    await SocietyBills.updateOne(
      { 'society.societyId': societyId, 'society.bills._id': id },
      { $pull: { 'society.bills': { _id: id } } }
    );

    return res.status(200).json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    console.log(`Error: ${error}`);
    return res.status(500).json({ success: false, message: "Error in deleting bill" });
  }
};

