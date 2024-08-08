const mongoose = require("mongoose");
const Amenity = require("../models/Amenities");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const shortid = require("shortid");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const destinationPath = path.join(__dirname, "../Uploads/Amenity");
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

exports.createAmenity = async (req, res) => {
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
        const { societyId, amenityName, capacity, timings, location, cost, chargePer, status} = req.body;

        const imagePath = req.file ? `/publicAmenity/${req.file.filename}` : "";
        const newAmenity = new Amenity({
          societyId,
          image: imagePath,
          amenityName,
          capacity,
          timings,
          location,
          cost,
          chargePer,
          status,
        });
        await newAmenity.save();
        
        return res.status(201).json({success:true, message: "Amenity created successfully", asset: newAmenity });
      } catch (error) {
        console.log(error)
        return res.status(500).json({success:false, error: error });
      }
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Error in " });
  }
};



exports.getAllAmenityBySocietyId = async (req, res) => {
  const { societyId } = req.params;
  try {
    const society = await Amenity.find({ societyId });
    if (!society) {
      return res.status(404).json({ success:false, message: "Society not found" });
    }
    return res.json({success:true, society});
  } catch (err) {
    console.error(err);
    res.status(500).json({success:false, error: err });
  }
};

exports.getAmenityById = async (req, res) => {
  const { id} = req.params;
  console.log(id)
  try {
    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({success:false, message: "Amenity not found" });
    }
    return res.status(201).json({success:true, amenity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAmenityOfCommunityHal = async (req, res) => {
  const { societyId } = req.params;
  try {
    const amenity = await Amenity.findOne({
      "societyId": societyId,
      "amenityName": "Community Hall"
    });
    if (!amenity) {
      return res.status(404).json({ success:false, message: "Amenity not found" });
    }
    return res.json({success:true, amenity});
  } catch (err) {
    console.error(err);
    res.status(500).json({success:false, error: err });
  }
};


exports.updateAmenity = async (req, res) => {
  const { id } = req.params;
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
        const updateFields = { ...req.body };
        if (req.file) {
          // Delete the old image if it exists
          const amenity = await Amenity.findById(id);
          if (amenity && amenity.image) {
            const oldImagePath = path.join(__dirname, "../Uploads/Amenity", path.basename(amenity.image));
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
          updateFields.image = `/publicAmenity/${req.file.filename}`;
        }

        const updatedAmenity = await Amenity.findByIdAndUpdate(id, updateFields, { new: true });
        if (!updatedAmenity) {
          return res.status(404).json({ success: false, message: "Amenity not found" });
        }
        
        return res.json({ success: true, message: "Amenity updated successfully", amenity: updatedAmenity });
      } catch (error) {
        console.error(`Error updating amenity: ${error}`);
        return res.status(500).json({ success: false, error: error.message });
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(500).json({ success: false, message: "Error in processing request" });
  }
};

exports.deleteAmenity = async (req, res) => {
  const { id } = req.params;
  try {
    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not found" });
    }

    // Delete the image from the filesystem
    if (amenity.image) {
      const imagePath = path.join(__dirname, "../Uploads/Amenity", path.basename(amenity.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Amenity.findByIdAndDelete(id);

    return res.json({ success: true, message: "Amenity deleted successfully" });
  } catch (error) {
    console.error(`Error deleting amenity: ${error}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Book an Amenity
exports.bookAmenity = async (req, res) => {
  const { id } = req.params; // Amenity ID
  const { userId, dateOfBooking, payed, pending, status} = req.body;
  try {
    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not found" });
    }
    const newBooking = {
      userId,
      bookedDate: Date.now(),
      dateOfBooking,
      payed,
      pending,
      status
    };
    amenity.list.push(newBooking);
    await amenity.save();
    return res.status(201).json({ success: true, message: "Amenity booked successfully" });
  } catch (error) {
    console.error(`Error booking amenity: ${error}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get Amenity by ID and User ID
exports.getAmenityByIdAndUserId = async (req, res) => {
  const { id, userId } = req.params;

  try {
    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not found" });
    }

    const booking = amenity.list.find((booking) => booking.userId.toString() === userId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found for this user" });
    }

    return res.json({ success: true,  booking });
  } catch (error) {
    console.error(`Error fetching amenity: ${error}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Update Amenity Booking
exports.updateAmenityBooking = async (req, res) => {
  const { id, userId } = req.params;

  try {
    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not found" });
    }

    const bookingIndex = amenity.list.findIndex((booking) => booking.userId.toString() === userId);
    if (bookingIndex === -1) {
      return res.status(404).json({ success: false, message: "Booking not found for this user" });
    }

    // Update only the fields provided in req.body
    const updateFields = req.body;
    amenity.list[bookingIndex] = { ...amenity.list[bookingIndex]._doc, ...updateFields };

    await amenity.save();

    return res.json({ success: true, message: "Booking updated successfully" });
  } catch (error) {
    console.error(`Error updating booking: ${error}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};



// Delete Amenity Booking
exports.deleteAmenityBooking = async (req, res) => {
  const { id, userId } = req.params;

  try {
    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not found" });
    }

    const bookingIndex = amenity.list.findIndex((booking) => booking.userId.toString() === userId);
    if (bookingIndex === -1) {
      return res.status(404).json({ success: false, message: "Booking not found for this user" });
    }

    amenity.list.splice(bookingIndex, 1);
    await amenity.save();

    return res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error(`Error deleting booking: ${error}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};
