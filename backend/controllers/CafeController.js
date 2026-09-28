const Cafe = require("../models/Cafe");

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
        const user = new Cafe(req.body);
        await user.save();
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
