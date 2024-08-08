const CommityMembers = require('../models/CommityMembers');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shortid = require('shortid');


const storage = multer.diskStorage({
  destination: function (res, file, cb) {
    const destinationPath = path.join(__dirname, '../Uploads/CommityMembers')
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true })
    }
    cb(null, destinationPath)
  },
  filename: function (res, file, cb) {
    cb(null, shortid.generate() + '-' + file.originalname)
  }
})

const upload = multer({ storage }).single('pictures');


exports.createCommityMembers = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log("error in uploading files:", err);
        return res.status(500).json({ success: false, message: 'An error Occoured in creating files' })
      }
      try {
        const { societyId, name, email, role, designation, phoneNumber, blockNumber, flatNumber } = req.body;
        let pictures = '';

        if (req.file) {
          pictures = `/publicCommityPictures/${req.file.filename}`;
        }

        const commityMember = new CommityMembers({
            societyId, name, email, role, designation, phoneNumber, blockNumber, flatNumber, pictures
        });
        await commityMember.save();
        return res.status(201).json({ success: true, message: "Commity Member Successfully Added" })
      } catch (error) {
        console.log(`error is ${error}`)
        return res.status(401).json({ success: false, message: `error is ${error}` })
      }
    })
  } catch (error) {
    console.log(`error in ${error}`)
    return res.status(301).json({ success: false, message: "Error in " })
  }
}


exports.getCommityMembersBySocietyId = async(req, res) => {
  try {
    const {societyId} = req.params;
    const commityMember = await CommityMembers.find({societyId});
    if(commityMember.length === 0){
      return res.status(301).json({success: false, message: "No Match Found"})
    }
    return res.status(201).json({success: true, commityMember});
  } catch (error) {
    return res.status(401).json({succes: false, meesage: `error is:${error}`})
  }
}

exports.getCommityMembersById= async(req, res) => {
  try {
    const {id} = req.params;
    const commityMember = await CommityMembers.findById(id);
    if(!commityMember){
      return res.status(301).json({success: false, message: "No Match Found"})
    }
    return res.status(201).json({success: true, commityMember});
  } catch (error) {
    return res.status(401).json({succes: false, meesage: `error is:${error}`})
  }
}

exports.editCommityMembers = async (req, res) => {
  try {
    upload(req, res, async (error) => {
      if (error) {
        console.error('Error uploading files:', error);
        return res.status(500).json({ success: false, message: 'Error in Uploading files', error });
      }

      const { id } = req.params;
      const uploadFields = { ...req.body };
      delete uploadFields.id;

      try {
        const commityMember = await CommityMembers.findById(id);
        if (!commityMember) {
          return res.status(404).json({ success: false, message: 'Commity Member not found' });
        }

        if (req.file) {
          // Handle existing picture deletion
          if (commityMember.pictures) {
            const imagePath = path.join(__dirname, '../Uploads/CommityMembers', path.basename(commityMember.pictures));
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            } else {
              console.log(`File ${imagePath} doesn't exist.`);
            }
          }

          // Update new picture in uploadFields
          uploadFields.pictures = `/publicCommityPictures/${req.file.filename}`;
        }

        const updatedCommityMember = await CommityMembers.findByIdAndUpdate(id, { $set: uploadFields }, { new: true });

        res.status(200).json({ success: true, message: 'Commity Member Updated Successfully'});
      } catch (error) {
        console.error('Error updating Commity Member:', error);
        res.status(500).json({ success: false, message: 'Failed to Update Commity Member', error: error.message });
      }
    });
  } catch (error) {
    console.error('Unknown error:', error);
    res.status(500).json({ success: false, message: 'Unknown error', error: error.message });
  }
};

exports.deleteCommityMembers = async (req, res) => {
    try {
      const { id } = req.params;
      const commityMembers = await CommityMembers.findById(id);
  
      if (!commityMembers) {
        return res.status(404).json({ success: false, message: "No Match Found" });
      }
  
      if (commityMembers.pictures) {
        const imagePath = path.join(__dirname, '../Uploads/CommityMembers', path.basename(commityMembers.pictures));
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (error) {
            console.error(`Error deleting file ${imagePath}: ${error}`);
          }
        }
      }
  
      await CommityMembers.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Commity Member Deleted Successfully" });
  
    } catch (error) {
      console.error(`Error deleting Commity Members: ${error}`);
      return res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
  };