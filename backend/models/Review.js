const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    crowdReport: {
        type: String,
        enum: ["quiet", "moderate", "packed"],
        default: "moderate",
    },
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
