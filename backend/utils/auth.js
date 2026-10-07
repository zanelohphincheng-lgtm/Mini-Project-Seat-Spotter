const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided." }); // 401 Unauthorized
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        // Expresses token expiration / invalid token clearly
        return res.status(401).json({ message: "Token invalid or expired." }); // 401 Unauthorized
    }
};