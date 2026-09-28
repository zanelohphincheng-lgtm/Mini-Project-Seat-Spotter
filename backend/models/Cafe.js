const mongoose = require("mongoose");

const cafeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    openingHours: {
        type: String,
        required: true,
    },
    isOpen: {
        type: Boolean,
        default: true,
    },
    currentCapacity: {
        type: Number,
        default: 0,
    },
    maxCapacityPerSlot: {
        type: Number,
        required: true,
        default: 20,
    },
    description: {
        type: String,
        default: "Description placeholders, please insert your own. :)"
    },
    imageUrl: {
        type: String,
        default: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
    },
});

const Cafe = mongoose.model("Cafe", cafeSchema);
module.exports = Cafe;
