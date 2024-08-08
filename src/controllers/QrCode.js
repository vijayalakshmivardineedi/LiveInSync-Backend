const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

exports.generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCodeFileName = uuidv4() + '.png'; 
    const qrCodeDir = path.join(__dirname, '../QrScanner');
    const qrCodeFilePath = path.join(qrCodeDir, qrCodeFileName);

    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    await QRCode.toFile(qrCodeFilePath, id);

    const qrCodeUrl = `/publicQRcodes/${qrCodeFileName}`;
        res.status(200).json({
      success: true,
      message: "QR Code generated successfully",
      qrCodeUrl: qrCodeUrl,
    });

    const qrCodeImage = fs.readFileSync(qrCodeFilePath);

  } catch (error) {
    console.error('Error generating QR Code:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR Code' });
  }
};

exports.handleScannedQRCode = async (req, res) => {
  try {
    const scannedContent = req.body.content; 

    res.status(200).json({
      success: true,
      message: "QR Code scanned content processed successfully",
      scannedContent: scannedContent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to process scanned content" });
  }
};
