const Cafe = require("../models/Cafe");
const User = require("../models/User")

exports.getAllCafes = async (req, res) => {
    const allCafes = await Cafe.find({});
    res.json(allCafes);
};

exports.getCafeById = async (req, res) => {
    const selectedCafe = await Cafe.findOne({ _id: req.params.id })
    res.json(selectedCafe)
}

exports.createCafe = async (req, res) => {
    try {
        const cafe = new Cafe(req.body);
        await cafe.save();
        res.status(201).json({ message: "Cafe Added Successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.editCafe = async (req, res) => {
    try {
        const editedCafe = await Cafe.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
        res.json(editedCafe);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteCafe = async (req, res) => {
    try {
        const allCafe = await Cafe.findOneAndDelete({ _id: req.params.id });
        res.status(204).send("Cafe Removed Successfully");
    } catch (error) {
        res.status(400).json({error: error.message})
    }
};

exports.toggleBookmark = async (req, res) => {
    try {
        const cafeId = req.params.id; // From URL: the Cafe being bookmarked
        const userId = req.user._id || req.user.userId; // From Auth Token: the User bookmarking it

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if this cafe ID is already in the user's bookmarks array
        const isBookmarked = user.bookmarks.includes(cafeId);

        if (isBookmarked) {
            // Remove cafeId from user's bookmarks array
            await User.findByIdAndUpdate(userId, { $pull: { bookmarks: cafeId } }); // $pull - Removes all instances of a specific value or items matching a condition from an existing array.
            return res.json({ message: "Bookmark removed", isBookmarked: false });
        } else {
            // Add cafeId to user's bookmarks array
            await User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: cafeId } }); // $addToSet - Adds a value to an array only if the value does not already exist in that array
            return res.json({ message: "Bookmark added", isBookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};