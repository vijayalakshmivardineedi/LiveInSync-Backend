const DemoRequest = require("../models/Demo")
const notifyModel = require("../models/Notifications")

exports.CreateDemo = async (req, res) => {
    const { name,
        email,
        phoneNumber,
        city,
        societyName } = req.body
    try {
        const demoData = new DemoRequest({
            name,
            email,
            phoneNumber,
            city,
            societyName,
        })
        await demoData.save()
        if (demoData) {
            const notifyData = new notifyModel({
                Category: "Demo Request",
                SenderName: name,
            })
            await notifyData.save()
        }
        return res.status(201).json({ success: true, message: "Demo Sent" })
    } catch (err) {
        return res.status(401).json({ success: false, message: `Demo not sent ${err}` })
    }
}
exports.updatedDemo = async (req, res) => {
    const { demoId } = req.params
    try {
        const demoData = await DemoRequest.findById(demoId);
        if (!demoData) {
            return res.status(404).json({ message: 'Demo not found' });
        }
        demoData.DemoAproval = true;
        await demoData.save()
        return res.status(201).json({ success: true, message: "Demo Sent" })
    } catch (err) {
        return res.status(401).json({ success: false, message: `Demo not sent ${err}` })
    }
}
exports.updatedDemoPresentedStatus = async (req, res) => {
    const { demoId } = req.params
    try {
        const demoData = await DemoRequest.findById(demoId);
        if (!demoData) {
            return res.status(404).json({ message: 'Demo not found' });
        }
        demoData.DemoPresented = true;
        demoData.demoPresentedDate = Date.now();
        await demoData.save()
        return res.status(201).json({ success: true, message: "Demo Presented to the Client" })
    } catch (err) {
        return res.status(401).json({ success: false, message: `Demo not Presented ${err}` })
    }
}
exports.getDemosForSuperAdmin = async (req, res) => {
    try {
        const demoData = await DemoRequest.find();
        if (!demoData) {
            return res.status(404).json({ message: 'Demo not found' });
        }
        return res.status(201).json({ success: true, demoData, message: "Demo Sent" })
    } catch (err) {
        return res.status(401).json({ success: false, message: `Demo not sent ${err}` })
    }
}