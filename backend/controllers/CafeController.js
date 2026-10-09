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
        const cafeId = req.params.id;
        // Extracts user ID safely from decoded JWT payload
        const userId = req.user?.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized user." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Support both field names ('bookmark' or 'bookmarks')
        const bookmarksList = user.bookmark || user.bookmarks || [];

        // Check if cafe exists in array by converting ObjectIds to string
        const isBookmarked = bookmarksList.some(
            (id) => id.toString() === cafeId.toString()
        );

        if (isBookmarked) {
            // Remove from user array
            await User.findByIdAndUpdate(userId, { 
                $pull: { bookmark: cafeId, bookmarks: cafeId } // $pull - Removes all instances of a specific value or items matching a condition from an existing array.
            });
            return res.status(200).json({ message: "Bookmark removed", isBookmarked: false });
        } else {
            // Add to user array
            await User.findByIdAndUpdate(userId, { 
                $addToSet: { bookmark: cafeId, bookmarks: cafeId } // $addToSet - Adds a value to an array only if the value does not already exist in that array.
            });
            return res.status(200).json({ message: "Bookmark added", isBookmarked: true });
        }
    } catch (error) {
        console.error("Toggle Bookmark Backend Error:", error);
        res.status(500).json({ error: error.message });
    }
};