const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
    cafe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cafe",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bookingDate: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
    },
    partySize: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending",
    },
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
module.exports = Reservation
