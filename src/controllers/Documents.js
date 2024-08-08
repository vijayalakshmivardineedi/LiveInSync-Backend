const Documents = require('../models/Documents');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shortid = require('shortid');


const storage = multer.diskStorage({
  destination: function (res, file, cb) {
    const destinationPath = path.join(__dirname, '../Uploads/Documents')
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


exports.createDocuments = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log("error in uploading files:", err);
        return res.status(500).json({ success: false, message: 'An error Occoured in creating files' })
      }
      try {
        const { societyId, name, documentTitle, blockNumber, flatNumber } = req.body;
        let pictures = '';

        if (req.file) {
          pictures = `/publicDocuments/${req.file.filename}`;
        }

        const document = new Documents({
          societyId, name, documentTitle, blockNumber, flatNumber, pictures
        });
        await document.save();
        return res.status(201).json({ success: true, message: "Successfully added" })
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


exports.getDocumentsBySocietyId = async(req, res) => {
  try {
    const {societyId} = req.params;
    const document = await Documents.find({societyId});
    if(document.length === 0){
      return res.status(301).json({success: false, message: "No Match Found"})
    }
    return res.status(201).json({success: true, document});
  } catch (error) {
    return res.status(401).json({succes: false, meesage: `error is:${error}`})
  }
}

exports.getDocumentsById= async(req, res) => {
  try {
    const {id} = req.params;
    const document = await Documents.findById(id);
    if(!document){
      return res.status(301).json({success: false, message: "No Match Found"})
    }
    return res.status(201).json({success: true, document});
  } catch (error) {
    return res.status(401).json({succes: false, meesage: `error is:${error}`})
  }
}

exports.editDocuments = async (req, res) => {
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
        const document = await Documents.findById(id);
        if (!document) {
          return res.status(404).json({ success: false, message: 'Commity Member not found' });
        }

        if (req.file) {
          // Handle existing picture deletion
          if (document.pictures) {
            const imagePath = path.join(__dirname, '../Uploads/Documents', path.basename(document.pictures));
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            } else {
              console.log(`File ${imagePath} doesn't exist.`);
            }
          }

          // Update new picture in uploadFields
          uploadFields.pictures = `/publicDocuments/${req.file.filename}`;
        }

        const updatedDocument = await Documents.findByIdAndUpdate(id, { $set: uploadFields }, { new: true });

        res.status(200).json({ success: true, message: 'Commity Member Updated Successfully', data: updatedDocument });
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

exports.deleteDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Documents.findById(id);

    if (!document) {
      return res.status(404).json({ success: false, message: "No Match Found" });
    }

    if (document.pictures) {
      const imagePath = path.join(__dirname, '../Uploads/Documents', path.basename(document.pictures));
      
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error(`Error deleting file ${imagePath}: ${error}`);
          return res.status(500).json({ success: false, message: "Error deleting file", error });
        }
      } else {
        console.log(`${imagePath} does not exist.`);
      }
    }

    // Delete the document from the database
    await Documents.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Successfully Deleted Documents!!!" });

  } catch (error) {
    console.error(`Error deleting Documents: ${error}`);
      return res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
  };