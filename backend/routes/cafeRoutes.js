const express = require('express')
const router = express.Router()
const auth = require('../utils/auth')
const CafeController = require('../controllers/CafeController')

router.use(express.json())

router.get('/', CafeController.getAllCafes)
router.get('/:id', CafeController.getCafeById)
router.post('/', CafeController.createCafe)
router.patch('/:id', auth.authenticate, CafeController.editCafe)
router.delete('/:id', auth.authenticate, CafeController.deleteCafe)

module.exports = router