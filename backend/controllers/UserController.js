const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getAllUsers = async (req, res) => {
    const allUsers = await User.find({});
    res.json(allUsers);
};

exports.getUserById = async (req, res) => {
    const selectedUser = await User.findOne({ _id: req.params.id })
    res.json(selectedUser)
}

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user"
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !user.comparePassword(req.body.password)) {
            throw new Error("Invalid email or password");
        }
        const token = jwt.sign({ userId: user._id, userEmail: user.email, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ 
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
         });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { password: hashedPassword },
            { new: true }
        );

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const allUser = await User.findOneAndDelete({ _id: req.params.id });
        res.status(204).send("User Deleted Successfully");
    } catch (error) {
        res.status(400).json({error: error.message})
    }
};

exports.getUserBookmarks = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?._id;
        const user = await User.findById(userId).populate("bookmark");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.bookmark || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};