 const mongoose = require('mongoose');

 const noticeBoardSchema = new mongoose.Schema({

    sender:{
        type: String,
        require:true,
    },
    subject:{
     type:String,
     require:true   
    },
    description:{
     type:String,
     require:true   
    },
    date: {
        type: Date,
        required: true,
      },
    time: {
        type: String,
        required: true,
      },
    status: {
      type: Boolean,
      default: false,
    }
    },{timestamps: true});

    module.exports = mongoose.model ('NoticeBoard', noticeBoardSchema);