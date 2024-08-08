const mongoose = require("mongoose");
const Assets = require("../models/Asset");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const shortid = require("shortid");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const destinationPath = path.join(__dirname, "../Uploads/Assets");
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    cb(null, destinationPath);
  },
  filename: function(req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage }).single("image");

const generatedUserIdCodes = new Set();
const generateAssetCode = () => {
  let userIdCode;
  do {
    userIdCode = "";
    for (let i = 0; i < 6; i++) {
      // Generating a 6-digit numeric code
      userIdCode += Math.floor(Math.random() * 10);
    }
  } while (generatedUserIdCodes.has(userIdCode));
  generatedUserIdCodes.add(userIdCode);
  return userIdCode;
};

exports.createAssets = async (req, res) => {
  try {
    upload(req, res, async err => {
      if (err) {
        console.error("Error in uploading file:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while uploading the file"
        });
      }
      try {
        const { societyId, facilityName, assetCost } = req.body;
        const imagePath = req.file ? `/publicAssets/${req.file.filename}` : "";
        const assetId = generateAssetCode();
        const newAsset = {
          assetId,
          image: imagePath,
          facilityName,
          assetCost
        };
        let society = await Assets.findOneAndUpdate(
          { "society.societyId": societyId },
          { $push: { "society.Assets": newAsset } },
          { new: true }
        );
        if (!society) {
          society = new Assets({
            society: {
              societyId: new mongoose.Types.ObjectId(societyId),
              Assets: [newAsset]
            }
          });
          await society.save();
        }
        res
          .status(201)
          .json({ message: "Asset created successfully", asset: newAsset });
      } catch (error) {
        console.error(`Error creating asset: ${error}`);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error(`Error in ${error}`);
    res.status(500).json({ success: false, message: "Error in " });
  }
};

exports.getAllAssetsBySocietyId = async (req, res) => {
  const { societyId } = req.params;
  try {
    const society = await Assets.findOne({ "society.societyId": societyId });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }
    res.json(society.society.Assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAssetByIdAndSocietyId = async (req, res) => {
  const { societyId, assetId } = req.params;
  try {
    const asset = await Assets.findOne({
      "society.societyId": societyId,
      "society.Assets.assetId": assetId
    });
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    const selectedAsset = asset.society.Assets.find(
      asset => asset.assetId === assetId
    );
    return res.status(200).json({success: true, asset: selectedAsset});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    upload(req, res, async (error) => {
      if (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ success: false, message: 'Error in uploading file', error });
      }
      const { societyId, assetId } = req.params;
      const { facilityName, purchaseDate, assetCost } = req.body;

      if (!societyId || !assetId) {
        return res.status(400).json({ message: 'Society ID or Asset ID not provided in request' });
      }

      try {
        const asset = await Assets.findOne({
          'society.societyId': societyId,
          'society.Assets.assetId': assetId
        });

        if (!asset) {
          return res.status(404).json({ message: 'Asset not found' });
        }

        const assetToUpdate = asset.society.Assets.find(a => a.assetId.toString() === assetId);

        if (!assetToUpdate) {
          return res.status(404).json({ message: 'Asset not found in society' });
        }

        const newImagePath = req.file ? `/publicAssets/${req.file.filename}` : null;

        if (newImagePath) {
          const oldImagePath = assetToUpdate.image;

          if (oldImagePath && fs.existsSync(path.join(__dirname, '../Uploads/Assets', path.basename(oldImagePath)))) {
            fs.unlinkSync(path.join(__dirname, '../Uploads/Assets', path.basename(oldImagePath)));
          }

          assetToUpdate.image = newImagePath;
        }

        assetToUpdate.facilityName = facilityName || assetToUpdate.facilityName;
        assetToUpdate.purchaseDate = purchaseDate || assetToUpdate.purchaseDate;
        assetToUpdate.assetCost = assetCost || assetToUpdate.assetCost;

        if (!assetToUpdate.image) {
          return res.status(400).json({ message: 'Image is required for this asset' });
        }

        await asset.save();

        res.status(200).json({ success: true, message: 'Asset updated successfully', data: assetToUpdate });

      } catch (err) {
        console.error('Error updating asset:', err);
        res.status(500).json({ error: err.message });
      }
    });
  } catch (err) {
    console.error('Unknown error:', err);
    res.status(500).json({ success: false, message: 'Unknown error', error: err.message });
  }
};

exports.deleteAsset = async (req, res) => {
  const { societyId, assetId } = req.params;
  if (!societyId || !assetId) {
    return res.status(400).json({ message: "societyId and assetId are required" });
  }
  try {
    const asset = await Assets.findOne({ "society.societyId": societyId, "society.Assets.assetId": assetId });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    const assetToDelete = asset.society.Assets.find(a => a.assetId.toString() === assetId);
    if (assetToDelete && assetToDelete.image) {
      const imagePath = path.join(__dirname, "../Uploads/Assets", path.basename(assetToDelete.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      } else {
        console.log(`File ${imagePath} doesn't exist.`);
      }
    }
    await Assets.findOneAndUpdate(
      { "society.societyId": societyId },
      { $pull: { "society.Assets": { assetId: assetId } } },
      { new: true }
    );
    res.json({ message: "Asset deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createRegistration = async (req, res) => {
  try {
    const { societyId, assetId } = req.params;
    const { userId, purchaseDate, expireDate, payed } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    const newRegistration = {
      userId: userId,
      purchaseDate: purchaseDate,
      expireDate: expireDate,
      payed
    };
    let assets = await Assets.findOne({ "society.societyId": societyId });

    if (!assets) {
      return res
        .status(404)
        .json({ message: "Assets not found for the given societyId" });
    }
    const asset = assets.society.Assets.find(
      asset => asset.assetId === assetId
    );

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    asset.list.push(newRegistration);
    await assets.save();
    res.status(201).json({
      message: "Registration created successfully",
      registration: newRegistration
    });
  } catch (error) {
    console.error(`Error creating registration: ${error}`);
    res.status(500).json({ error: error.message });
  }
};