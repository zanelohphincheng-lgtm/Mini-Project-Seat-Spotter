const Reservation = require("../models/Reservation");
const Cafe = require("../models/Cafe");

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Logged in Users)
exports.createReservation = async (req, res) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json(reservation);
    } catch (error) {
        res.status(400).json({ error: error.message }); // Returns 400 Bad Request
    }
};

// @desc    Get reservations (Users see their own; Admin sees all)
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res) => {
    try {
        let query = {};

        // If user is NOT an admin, filter to only show THEIR reservations
        if (req.user.role !== "admin") {
            query.user = req.user.id;
        }

        // .populate() replaces foreign key ObjectIds with actual object details
        const reservations = await Reservation.find(query)
            .populate("cafe", "name address city") // Pulls specified fields from Cafe model
            .populate("user", "name email") // Pulls specified fields from User model
            .sort({ bookingDate: 1 });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update reservation status or details
// @route   PUT /api/reservations/:id
// @access  Private
exports.updateReservation = async (req, res) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservation not found." });
        }

        // Ensure non-admins can only update their own reservations
        if (req.user.role !== "admin" && reservation.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to update this booking." });
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: reservation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cancel/Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservation not found." });
        }

        // Ownership check
        if (req.user.role !== "admin" && reservation.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this booking." });
        }

        await reservation.deleteOne();

        res.status(200).json({ success: true, message: "Reservation cancelled successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
