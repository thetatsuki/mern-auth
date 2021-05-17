const { Router } = require("express");
const usersCtrl = require("../controllers/userCtrl");
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

const router = Router()

router.post('/registr', usersCtrl.registr)
router.post('/activate', usersCtrl.activateEmail)
router.post('/login', usersCtrl.login)
router.post('/refresh_token', usersCtrl.getAccessToken)
router.post('/forgot', usersCtrl.forgotPassword)
router.post('/reset', auth, usersCtrl.resetPassword)
router.post('/edit_user', auth, usersCtrl.editUser)


router.get('/logout', usersCtrl.logout)
router.get('/get_users', auth ,usersCtrl.getUsers)
router.get('/infor', auth, usersCtrl.getUserInfor)
router.get('/get_all_users', auth,usersCtrl.getAllUsers)

router.patch('/edit_user_role/:id', auth, authAdmin, usersCtrl.editUserRole)
router.patch('/remove_users/:id', auth, authAdmin, usersCtrl.deleteUser)

module.exports = router


