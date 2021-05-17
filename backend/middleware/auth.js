const jwt = require('jsonwebtoken')
const config = require('config')

const auth = (req, res, next) => {
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(400).json({msg: "Вы не авторизованы"})

        jwt.verify(token, config.get('ACCES_TOKEN_SECRET'), (err, user) => {
            if(err) return res.status(400).json({msg: "Invalid auth, ERR КАКОЙ-ТО"})
            req.user = user
            next()
        })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = auth