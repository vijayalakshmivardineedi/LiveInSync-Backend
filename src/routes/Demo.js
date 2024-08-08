const express = require("express")
const { CreateDemo, updatedDemo, getDemosForSuperAdmin, updatedDemoPresentedStatus } = require("../controllers/Demo")
const router = express.Router()


router.post("/demoRequest", CreateDemo)
router.put("/demoStatus/:demoId", updatedDemo)
router.put("/demoPresentedStatus/:demoId", updatedDemoPresentedStatus)
router.get("/getDemos", getDemosForSuperAdmin)
module.exports = router