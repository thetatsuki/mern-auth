const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    name: {
        type: String, 
        required: [true, "Пожалуйста введите ваш никнейм!"],
        trim: true
    },
    email: {
        type: String, 
        required: [true, "Пожалуйста введите вашу почту!"],
        trim: true,
        unique: true
    },
    password: {
        type: String, 
        required: [true, "Пожалуйста введите ваш пароль!"],
    }, 
    role: {
        type: Number,
        default: 0, // 0 = пользователь, 1 = админ
    }, 
    avatar: {
        type: String,
        default: "https://www.kosher.com/resized/open_graph/u/s/user_avatar.png"
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('User', userSchema)