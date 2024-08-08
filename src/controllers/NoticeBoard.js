const NoticeBoard = require("../models/NoticeBoard");

 exports.createNotice = async(req,res) => {
    try {
        const {sender, subject, description, date, time} = req.body;
        const notice = new NoticeBoard ({
            sender, subject, description, date, time
        });
        await notice.save();
        return res.status(201).json({success:true, message: "Successfully Created!!!"})
    } catch (error) {
        return res.status(401).json({success:false, message: "Error:", error})
    }
 }

 exports.getNotice = async(req, res) => {
    try {
        const notices = await NoticeBoard.find().sort({createdAt : -1});
        return res.status(201).json({success: true, notices});
    } catch (error) {
        return res.status(401).json({success: false, error}); 
    }
 }

 exports.editNotice = async(req, res) => {
    try {
        const {id} = req.params;
        const updateField = { ...req.body };
      
        const notice = await NoticeBoard.findById(id);
        if(!notice){
            return res.status(301).json({success:false, message:"No Match Found"});
        }
        const newNotice = await NoticeBoard.findByIdAndUpdate(id, {$set: updateField}, {new: true});
        return res.status(201).json({success: true, message: "Successfully Updated", newNotice})
    
    } catch (error) {
        return res.status(401).json({success: false, message: "Error in Updating", error})
    
    }
 }

 exports.deleteNotice = async(req,res) =>{
    try {
        const {id} = req.params;
        const notice = await NoticeBoard.findById(id);

        if(!notice){
            return res.status(301).json({success: false, message:"NO Match Found"});
        }
        await NoticeBoard.findByIdAndDelete(id);
        return res.status(201).json({success: true, message: "Successfully Deleted"});
        
    } catch (error) {
        return res.status(401).json({success: false, error});
    }
 }
