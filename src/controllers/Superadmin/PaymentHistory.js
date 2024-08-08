const SuperAdminPayments = require("../../models/Superadmin/PaymentHistory")

exports.GetPaymentsList = async (req, res) => {
    try {
        const getPayments = await SuperAdminPayments.find()
        res.status(201).json({ getPayments })
    } catch (error) {
        console.log(error)
        res.status(201).json({ error })
    }
}