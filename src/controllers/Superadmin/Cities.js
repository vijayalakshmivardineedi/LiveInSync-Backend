// controllers/Superadmin/Cities.js
const City = require('../../models/Superadmin/Cities');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shortid = require('shortid');

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '../../Uploads/Cities');
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname);
    }
});

const upload = multer({ storage }).single('image');

// Create a city
exports.createCity = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    try {
      const { name } = req.body;
      const image = req.file ? `/publicCities/${req.file.filename}` : null;  
      const newCity = new City({ name, image });
      await newCity.save();
      res.status(201).json({ message: 'City created successfully', city: newCity });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// Get all cities
exports.getCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.json({ cities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific city by ID
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.cityId);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.json(city);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateCity = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: err.message });
    }
    try {
      const { name } = req.body;
      const image = req.file ? `/publicCities/${req.file.filename}` : null;  
      const updateData = { name };
      if (image) updateData.image = image;

      const updatedCity = await City.findByIdAndUpdate(req.params.cityId, updateData, { new: true });
      if (!updatedCity) {
        return res.status(404).json({ message: 'City not found' });
      }
      res.json({ message: 'City updated successfully', city: updatedCity });
    } catch (err) {
      console.error('Update city error:', err);
      res.status(500).json({ error: err.message });
    }
  });
};

// Delete a city
exports.deleteCity = async (req, res) => {
  try {
    const deletedCity = await City.findByIdAndDelete(req.params.cityId);
    if (!deletedCity) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.json({ message: 'City deleted successfully', city: deletedCity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
