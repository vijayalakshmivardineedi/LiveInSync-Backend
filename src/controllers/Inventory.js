const mongoose = require("mongoose");
const Inventory = require('../models/Inventory');

exports.createInventory = async (req, res) => {
  try {
    const { societyId, name, quantity } = req.body;
    const newInventoryItem = new Inventory({
      societyId,
      name,
      quantity
    });

    const savedInventory = await newInventoryItem.save();
    res.status(201).json({success:true, message: "Successfully Created"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.findById( id );
    res.status(200).json({success:true, inventory});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const { societyId } = req.params;
    const inventory = await Inventory.find({ societyId });
    res.status(200).json({success: true, inventory});
  } catch (error) {
    res.status(500).json({success: false, error: error.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity } = req.body;

    const updatedItem = await Inventory.findOneAndUpdate(
      { _id: id },
      { $set: { name, quantity } },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({success: false, message: 'Inventory item not found' });
    }

    res.status(200).json({success: false, message: "Successfully Updated"});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Inventory.findOneAndDelete({ _id: id });

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.status(200).json({success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};