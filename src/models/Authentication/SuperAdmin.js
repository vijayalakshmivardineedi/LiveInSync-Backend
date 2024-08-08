const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const superAdminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 20,
    },
    secondName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    hash_password: {
      type: String,
      required: true,
    },
    role: {
        type: String,
        enum: ["SuperAdmin"],
        default: "SuperAdmin",
      },
    contactNumber: { 
      type: String 
    },
    profilePicture: { 
      type: String 
    },
  },
  { timestamps: true }
);



superAdminSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.secondName}`;
});

superAdminSchema.methods = {
  authenticate: async function (password) {
    return await bcrypt.compare(password, this.hash_password);
  },
};
superAdminSchema.virtual("password").set(function (password) {
  // Hash the password with the defined salt rounds
  this.hash_password = bcrypt.hashSync(password, saltRounds);
});

module.exports = mongoose.model("SuperAdmin", superAdminSchema);

