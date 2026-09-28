const express = require('express')
const router = express.Router()
const auth = require('../utils/auth')
const UserController = require('../controllers/UserController')

router.use(express.json())

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.patch('/:id', auth.authenticate, UserController.updateUser)
router.delete('/:id', auth.authenticate, UserController.deleteUser)

module.exports = router