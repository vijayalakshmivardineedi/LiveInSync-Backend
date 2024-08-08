const SocietyIncome = require('../models/SocietyIncome');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shortid = require('shortid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, '../Uploads/SocietyIncome');
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

exports.createIncome = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error uploading file' });
      }

      try {
        const { societyId, userId, blockno, flatno, name, transactionType, transactionId, status, amount, monthAndYear } = req.body;
        let pictures = {};

        if (req.file) {
          pictures = `/publicSocietyIncome/${req.file.filename}`;
        }

        // Check for existing payment with the same userId and monthAndYear
        const existingPayment = await SocietyIncome.findOne({
          'society.societyId': societyId,
          'society.payments.userId': userId,
          'society.payments.monthAndYear': monthAndYear
        });

        if (existingPayment) {
          return res.status(400).json({ success: false, message: "Payment already made for the specified month and year" });
        }

        const existingSociety = await SocietyIncome.findOne({ 'society.societyId': societyId });

        if (existingSociety) {
          existingSociety.society.payments.push({
            userId,
            blockno,
            flatno,
            name,
            transactionType,
            transactionId,
            status,
            amount,
            monthAndYear,
            payedOn: Date.now(),
            pictures: pictures
          });

          await existingSociety.save();
        } else {
          const societyPayment = new SocietyIncome({
            society: {
              societyId,
              payments: [{
                userId,
                blockno,
                flatno,
                name,
                transactionType,
                transactionId,
                status,
                amount,
                monthAndYear,
                payedOn: Date.now(),
                pictures: pictures
              }]
            }
          });

          await societyPayment.save();
        }
        return res.status(201).json({ success: true, message: "Payment created successfully" });
      } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in creating payment" });
  }
};

exports.getIncomeBySocietyId = async (req, res) => {
  const { societyId } = req.params;
  try {
    const payments = await SocietyIncome.find({ 'society.societyId': societyId }, { 'society': 1, '_id': 0 });

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: "No payments found for this society" });
    }

    return res.status(200).json({ success: true, society: payments[0].society });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error: ${error}` });
  }
};



exports.getIncomeById = async (req, res) => {
  const { societyId, id } = req.params;
  try {
    const payment = await SocietyIncome.findOne(
      {
        'society.societyId': societyId,
        'society.payments._id': id
      },
      {
        'society.payments.$': 1
      }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    return res.status(200).json({ success: true, payment: payment.society.payments[0] });
  } catch (error) {
    console.log(`Error: ${error}`);
    return res.status(500).json({ success: false, message: `Error: ${error}` });
  }
};

exports.editIncome = async (req, res) => {
  try {
    upload(req, res, async (error) => {
      if (error) {
        console.error('Error uploading files:', error);
        return res.status(500).json({ success: false, message: 'Error in uploading files', error });
      }

      const { id, societyId } = req.params;
      const uploadFields = { ...req.body };
      delete uploadFields.id;

      try {
        // Find the specific payment document
        const paymentDocument = await SocietyIncome.findOne({
          'society.societyId': societyId,
          'society.payments._id': id
        });

        if (!paymentDocument) {
          return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        const paymentItem = paymentDocument.society.payments.id(id);

        if (req.file) {
          // Handle existing picture deletion if it exists
          if (paymentItem.pictures) {
            const oldImagePath = path.join(__dirname, '../Uploads/SocietyIncome', path.basename(paymentItem.pictures));
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          // Update new picture in uploadFields
          uploadFields.pictures = `/publicSocietyIncome/${req.file.filename}`;
        }

        // Update the specific payment item in the payments array
        paymentItem.set(uploadFields);

        await paymentDocument.save();

        res.status(200).json({ success: true, message: 'Payment updated successfully'});
      } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ success: false, message: 'Failed to update payment', error: error.message });
      }
    });
  } catch (error) {
    console.error('Unknown error:', error);
    res.status(500).json({ success: false, message: 'Unknown error', error: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const { societyId, id } = req.params;
    const payment = await SocietyIncome.findOne({ 'society.societyId': societyId, 'society.payments._id': id });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Delete image if exists
    const paymentItem = payment.society.payments.id(id);
    if (paymentItem.pictures) {
      const imagePath = path.join(__dirname, '../Uploads/SocietyIncome', path.basename(paymentItem.pictures));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await SocietyIncome.updateOne(
      { 'society.societyId': societyId, 'society.payments._id': id },
      { $pull: { 'society.payments': { _id: id } } }
    );

    return res.status(200).json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.log(`Error: ${error}`);
    return res.status(500).json({ success: false, message: "Error in deleting payment" });
  }
};