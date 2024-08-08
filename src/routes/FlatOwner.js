const express=require("express");
const { AddFlatOwnerDetails, getBySocietyId, getBySocietyIdAndUserId, DeleteFlatOwnerDetails, UpdateFlatOwnerDetails} = require("../controllers/FlatOwner");
const router=express.Router()

router.post("/addFlateOwner",AddFlatOwnerDetails);
router.get("/getBySocietyId/:societyId", getBySocietyId);
router.get("/getflatBySocietyIdAndUserId/:societyId/:id", getBySocietyIdAndUserId);
router.put("/updateFlatOwnerDetails/:id", UpdateFlatOwnerDetails);
router.delete("/deleteFlatOwnerDetails/:id", DeleteFlatOwnerDetails);

module.exports=router