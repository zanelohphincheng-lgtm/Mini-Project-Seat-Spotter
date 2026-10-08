const express = require('express')
const router = express.Router()
const auth = require('../utils/auth')
const CafeController = require('../controllers/CafeController')

router.use(express.json())

router.get('/', CafeController.getAllCafes)
router.get('/:id', auth.authenticate, CafeController.getCafeById)
router.post('/', auth.authenticate, CafeController.createCafe)
router.post('/:id/bookmark', auth.authenticate, CafeController.toggleBookmark);
router.patch('/:id', auth.authenticate, CafeController.editCafe)
router.delete('/:id', auth.authenticate, CafeController.deleteCafe)

module.exports = router