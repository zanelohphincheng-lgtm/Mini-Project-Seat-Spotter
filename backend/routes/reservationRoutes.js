const express = require('express')
const router = express.Router()
const auth = require('../utils/auth')
const ReservationController = require('../controllers/ReservationController')

router.use(express.json())

router.get('/', auth.authenticate, ReservationController.getReservations)
router.post('/', auth.authenticate, ReservationController.createReservation)
router.patch('/:id', auth.authenticate, ReservationController.updateReservation)
router.delete('/:id', auth.authenticate, ReservationController.deleteReservation)

module.exports = router