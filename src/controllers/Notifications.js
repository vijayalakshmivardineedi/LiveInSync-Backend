const Notification = require('../models/Notifications');
exports.getNotifications = async (req, res) => {
    try {
        console.log(req.body.email)
        const NotifyData = await Notification.find();
        if (!NotifyData) {
            return res.status(400).json({ message: "SocietyAdmin not found" });
        }
        res.status(200).json({
            NotifyData
        });
    } catch (error) {
        console.error("Finding error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}
exports.deleteNotification = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the notification by ID and delete it
        const notifyData = await Notification.findByIdAndDelete(id);

        // Check if the notification was found and deleted
        if (!notifyData) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        // Return a success response
        return res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ success: false, message: "Unable to delete notification" });
    }
};
