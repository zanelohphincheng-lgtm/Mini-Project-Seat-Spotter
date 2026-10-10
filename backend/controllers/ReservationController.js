const Reservation = require("../models/Reservation");
const Cafe = require("../models/Cafe");

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Logged in Users)
exports.createReservation = async (req, res) => {
    try {
        const { cafeId, cafe, bookingDate, timeSlot, partySize, status } = req.body;
        const targetCafe = cafeId || cafe;
        const userId = req.user?.userId || req.user?._id;

        const bookingStatus = status || "pending";

        if (!targetCafe) {
            return res.status(400).json({ success: false, message: "Cafe ID is required." });
        }

        // Create and save the new reservation
        const reservation = new Reservation({
            user: userId,
            cafe: targetCafe,
            bookingDate,
            timeSlot,
            partySize,
            status: bookingStatus
        });
        await reservation.save();

        // Only count towards current capacity if status is confirmed
        if (bookingStatus === "confirmed") {
            await Cafe.findByIdAndUpdate(targetCafe, {
                $inc: { currentCapacity: Number(partySize) }
            });
        }

        res.status(201).json({ message: "Reservation submitted successfully!", reservation });
    } catch (error) {
        console.error("Failed to create  reservation : ", error);
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
        const reservationId = req.params.id;
        const oldReservation = await Reservation.findById(reservationId);

        if (!oldReservation) {
            return res.status(404).json({ success: false, message: "Reservation not found." });
        }

        const oldStatus = oldReservation.status;
        const oldPartySize = oldReservation.partySize;
        const cafeId = oldReservation.cafe;

        // Extract new values from request body or keep old ones
        const newStatus = req.body.status !== undefined ? req.body.status : oldStatus;
        const newPartySize = req.body.partySize !== undefined ? Number(req.body.partySize) : oldPartySize;

        // Update the reservation in the database
        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId, 
            req.body, 
            { returnDocument: 'after', runValidators: true }
        );

        // --- STABLE CAPACITY ADJUSTMENT LOGIC ---
        if (oldStatus !== "confirmed" && newStatus === "confirmed") {
            // Moved TO confirmed -> Add capacity back
            await Cafe.findByIdAndUpdate(cafeId, {
                $inc: { currentCapacity: newPartySize }
            });
        } else if (oldStatus === "confirmed" && newStatus !== "confirmed") {
            // Moved FROM confirmed to pending/cancelled -> Remove capacity
            await Cafe.findByIdAndUpdate(cafeId, {
                $inc: { currentCapacity: -oldPartySize }
            });
        } else if (oldStatus === "confirmed" && newStatus === "confirmed" && oldPartySize !== newPartySize) {
            // Stayed confirmed, but party size changed -> Adjust the difference
            const difference = newPartySize - oldPartySize;
            await Cafe.findByIdAndUpdate(cafeId, {
                $inc: { currentCapacity: difference }
            });
        }

        res.status(200).json({ success: true, data: updatedReservation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cancel/Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservation not found." });
        }

        // If the reservation was confirmed, decrement the cafe's current capacity
        if (reservation.status === "confirmed") {
            await Cafe.findByIdAndUpdate(reservation.cafe, {
                $inc: { currentCapacity: -reservation.partySize }
            });
        }

        // Delete the reservation
        await Reservation.findByIdAndDelete(reservationId);

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
