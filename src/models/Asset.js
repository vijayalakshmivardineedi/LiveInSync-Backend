const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
  society: {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SocietyAdmin"
    },
    Assets: [
      {
        assetId: {
          type: String,
          required: true,
          unique: true
        },
        image: {
          type: String,
          required: true
        },
        facilityName: {
          type: String,
          required: true
        },
        assetCost: {
          type: String,
          required: true
        },
        list: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              required: true,
              ref: "UserProfile"
            },
            purchaseDate: {
              type: Date,
              required: true
            },
            expireDate: {
              type: Date,
              required: true
            },
            payed: {
              type: String,
              required: true
            }
          }
        ]
      }
    ]
  }
});
module.exports = mongoose.model("Assets", AssetSchema);