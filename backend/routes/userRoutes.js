const express = require('express')
const router = express.Router()
const auth = require('../utils/auth')
const UserController = require('../controllers/UserController')

router.use(express.json())

router.get('/', auth.authenticate, UserController.getAllUsers)
router.get('/:id', auth.authenticate, UserController.getUserById)
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.patch('/:id/reset-password', auth.authenticate, UserController.changePassword)
router.patch('/:id', auth.authenticate, UserController.updateUser)
router.delete('/:id', auth.authenticate, UserController.deleteUser)

module.exports = router