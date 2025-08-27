const jwt = require("jsonwebtoken");

// Middleware to protect routes and verify JWT token
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user information to the request object
        req.user = decoded;
        req.userId = decoded.userId; 
        next();
    } catch (error) {
        console.error("Token Verification Error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware to check if the user has a specific role
const roleCheck = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: `Unauthorized: Only ${role}s can access this endpoint.` });
        }
        next();
    };
};

module.exports = { protect, roleCheck };
