const express = require('express')
const router = express.Router()
const auth = require('../utils/auth')
const ReviewController = require('../controllers/ReviewController')

router.use(express.json())

router.get('/:id', ReviewController.getReviewsByCafe)
router.post('/new-review', auth.authenticate, ReviewController.createReview)
router.patch('/:id', auth.authenticate, ReviewController.updateReview)
router.delete('/:id', auth.authenticate, ReviewController.deleteReview)

module.exports = router