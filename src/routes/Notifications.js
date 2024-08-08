const express = require("express")
const { getNotifications, deleteNotification } = require("../controllers/Notifications")
const router = express.Router()

router.get("/getAllNotification", getNotifications)
router.delete("/deleteNotification/:id", deleteNotification)
module.exports = router

