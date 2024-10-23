const jwt = require('jsonwebtoken');
const JWT_SECRET = 'nizaR*123'; // Replace with your actual secret

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token required" }); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Add specific error message if the token is invalid or expired
            return res.status(403).json({ message: "Invalid or expired token" }); // Forbidden
        }

        // Optional: Further checks on the user data within the token
        if (!user.id || !user.email) {
            return res.status(403).json({ message: "Invalid token payload" });
        }

        req.user = user; // Attach the user data to the request
        next(); // Proceed to the next middleware or route
    });
};
module.exports = authenticateToken;