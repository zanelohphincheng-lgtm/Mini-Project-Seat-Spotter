const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    bookmark: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cafe",
    }],
});

UserSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        next;
    }
    this.password = bcrypt.hashSync(this.password, Number(process.env.BCRYPT_SALT_ROUNDS));
    next;
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("user", UserSchema);
module.exports = User;
