const Users = require('../models/userModels')


const authAdmin = async (req, res, next) => {
    try {
        const user = await Users.findOne({ _id: req.user.id })
        if (user.role !== 1) return res.json({ msg: "Вы не админ" })
        next()
    } catch (error) {
        return res.json({msg: error.message})
    }
}

module.exports = authAdmin