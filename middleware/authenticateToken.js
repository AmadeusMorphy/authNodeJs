const jwt = require('jsonwebtoken');
const JWT_SECRET = 'p5XqM279OM6vPZP4VoFugaEO8gEMrGbsAU7Jg+acIU05yVFU/3L52dsqBvnuRXXZT4ZxR7rs0O98j74WMykrjQ=='; // Replace with your actual secret

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.error("Authentication error: Token required.");
        return res.status(401).json({ message: "Token required" }); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Authentication error:", err);
            // Add specific error message if the token is invalid or expired
            return res.status(403).json({ message: "Invalid or expired token" }); // Forbidden
        }

        // Optional: Further checks on the user data within the token
        if (!user.id || !user.email) {
            console.error("Invalid token payload:", user);
            return res.status(403).json({ message: "Invalid token payload" });
        }

        req.user = user; // Attach the user data to the request
        next(); // Proceed to the next middleware or route
    });
};

module.exports = authenticateToken;
