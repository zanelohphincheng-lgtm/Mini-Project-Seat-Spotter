const Review = require("../models/Review");
const Cafe = require("../models/Cafe");

// @desc    Create a review for a specific café
// @route   POST /api/cafes/:cafeId/reviews
// @access  Private (Logged in Users)
exports.createReview = async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message }); // Returns 400 Bad Request
    }
};

// @desc    Get all reviews for a specific café
// @route   GET /api/cafes/:cafeId/reviews
// @access  Public
exports.getReviewsByCafe = async (req, res) => {
    try {
        const reviews = await Review.find({ cafe: req.params.cafeId })
            .populate("user", "name") // Foreign key lookup: attaches reviewer's name
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review Owner or Admin)
exports.updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        // Authorization check: Verify if req.user is the owner or an admin
        if (req.user.role !== "admin" && review.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to edit this review.",
            });
        }

        // Update rating, comment, or crowdReport fields
        review = await Review.findByIdAndUpdate(
            req.params.id,
            {
                rating: req.body.rating,
                comment: req.body.comment,
                crowdReport: req.body.crowdReport,
            },
            {
                new: true, // Returns updated document
                runValidators: true, // Enforces schema validation rules
            },
        );

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        // Only owner of review or admin can delete
        if (req.user.role !== "admin" && review.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this review." });
        }

        await review.deleteOne();

        res.status(200).json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
