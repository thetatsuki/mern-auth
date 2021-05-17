const Users = require('../models/userModels')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('config')
const sendMail = require('./sendMail')


const CLIENT_URL = config.get("CLIENT_URL")

const usersCtrl = {
    registr: async (req, res) => {
        try {
            const { name, email, password } = req.body

            if (!name || !email || !password) {
                return res.status(400).json({ msg: "Пожалуйста заполните все данные" })
            }

            // проверка на правильность почты
            if (!validateEmail(email)) {
                return res.status(400).json({ msg: "Введите корректный email" })
            }

            if (password.length < 6) {
                return res.status(400).json({ msg: "Пароль должен быть больше 6 символов" })
            }

            // хеширование пароля
            const hashPassword = await bcrypt.hash(password, 10)

            // проверка есть ли пользователь с таким email
            const checkUser = await Users.findOne({ email })
            if (checkUser) {
                return res.json({ msg: "Пользователь с такой почтой уже существует" })
            }
            const user = new Users({ name, email, password: hashPassword })


            // JWT и отправка на Email для активации
            // const activation_token = createActivationToken(user)
            // const url = `${CLIENT_URL}/user/activate/${activation_token}`
            // sendMail(email, url)
            await user.save()
            return res.json({ msg: "Аккаунт зарегестрирован" })
        } catch (e) {
            return res.status(500).json({ msg: e.message })
        }
    },
    activateEmail: async (req, res) => {
        try {
            const { activation_token } = req.body
            const user = jwt.verify(activation_token, config.get('ACTIVATION_TOKEN_SECRET'))

            const { name, email, password } = user
            const newUser = new Users({
                name, email, password
            })

            await newUser.save()
            return res.json({ msg: "Аккаунт активирован!" })
        } catch (err) {
            return res.json({ msg: "Не верный токен :(" })
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await Users.findOne({ email })
            if (!user) return res.status(400).json({ msg: "Аккаунт с такой почтой не был найден" })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({ msg: "Не верный пароль :3" })

            const refresh_token = createRefreshToken({ id: user._id })
            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            res.json({ msg: "Вошли в аккаунт" })
        } catch (e) {
            return res.status(500).json({ msg: e.message })
        }
    },
    getAccessToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if (!rf_token) return res.status(400).json({ msg: "Пожалуйста авторизуйтесь" })

            jwt.verify(rf_token, config.get('REFRESH_TOKEN_SECRET'), (err, user) => {
                if (err) return res.status(400).json({ msg: "Пожалуйста авторизуйтесь" })

                const access_token = createAccessToken({ id: user.id })
                res.json({ access_token })
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    // отправка токена на почту
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body
            const user = await Users.findOne({ email })
            if (!user) return res.status(400).json({ msg: "Пользователя с таким email не существует" })

            const access_token = createAccessToken({ id: user._id })
            const url = `${CLIENT_URL}/user/reset/${access_token}`

            sendMail(email, url)
            res.json({ msg: "Resend password, пожалуйста проверьте вашу почту" })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    // смена пароля
    resetPassword: async (req, res) => {
        try {
            const { password } = req.body
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({ _id: req.user.id }, {
                password: passwordHash
            })

            res.json({ msg: "Пароль успешно изменен!" })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getUserInfor: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password')
            if (!user) return res.json({ msg: 'не верный токен' })
            res.json(user)
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await Users.find().select("-password")
            res.json(users)
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/user/refresh_token' })
            return res.json({ msg: "Успешно вышли из аккаунта." })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    editUser: async (req, res) => {
        try {
            const { avatar, name } = req.body

            if(!name || !avatar) return res.status(400).json({msg: "пожалуйста введите все данные"})

            await Users.findOneAndUpdate({_id: req.user.id}, {
                avatar, name
            })
                
            return res.json({msg: "Изменение были внесены"})
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    editUserRole: async (req, res) => {
        try {
            const { role } = req.body
            await Users.findOneAndUpdate({ _id: req.params.id }, {
                role
            })
            return res.json({ msg: "Роль была успешно изменена" })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    deleteUser: async (req, res) => {
        try {
            await Users.findByIdAndDelete({_id: req.params.id})
            return res.json({msg: "Пользователь успешно удален! :D"})
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },

    getUsers: async(req, res) => {
        try {
            const users = await Users.find().select("-password")
            const lastUsers = []

            for (let i = 0; i < users.length; i++) {
                if(i >= users.length - 5) {
                    lastUsers.push(users[i])
                }
            }
            res.json(lastUsers.reverse())
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    }
}


function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


const createActivationToken = (payload) => {
    return jwt.sign(payload.toJSON(), config.get('ACTIVATION_TOKEN_SECRET'), { expiresIn: '5m' })
}
const createAccessToken = (payload) => {
    return jwt.sign(payload, config.get('ACCES_TOKEN_SECRET', { expiresIn: '15m' }))
}
const createRefreshToken = (payload) => {
    return jwt.sign(payload, config.get('REFRESH_TOKEN_SECRET'), { expiresIn: '7d' })
}


module.exports = usersCtrl