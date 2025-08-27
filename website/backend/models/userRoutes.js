const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Strong Password Validation
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, role, password } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !role || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Validate password strength
        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // Role-specific fields
        let userData = { name, email, phone, role, password };

        if (role === "municipal") {
            const { department } = req.body;
            if (!department) {
                return res.status(400).json({ message: "Department is required for municipal users." });
            }
            userData.department = department;
        } else if (role === "citizen") {
            const { address, location } = req.body;
            if (!address || !location) {
                return res.status(400).json({ message: "Address and location are required for citizens." });
            }
            userData.address = address;
            userData.location = location;
        } else if (role === "driver") {
            const { license, vehicle } = req.body;
            if (!license || !vehicle) {
                return res.status(400).json({ message: "License and vehicle are required for drivers." });
            }
            userData.license = license;
            userData.vehicle = vehicle;
        } else {
            return res.status(400).json({ message: "Invalid role." });
        }

        // Save user to database (password hashing is handled in the User model)
        const user = new User(userData);
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Remove sensitive data from response
        const userResponse = user.toJSON();

        res.status(201).json({ message: "User registered successfully", token, user: userResponse });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate required fields
        if (!email || !password || !role) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Trim and lowercase email
        const trimmedEmail = email.trim().toLowerCase();

        // Find user by email
        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Compare passwords
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Check if the user's role matches the requested role
        if (user.role !== role) {
            return res.status(401).json({ message: "Invalid role for this user." });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Remove sensitive data from response
        const userResponse = user.toJSON();

        res.json({ message: "Login successful", token, role: user.role, user: userResponse });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login error", error: error.message });
    }
});

// Update User Profile
/**router.put("/update-profile", async (req, res) => {
    try {
        const { name, email, phone, password, department, address, location, license, vehicle } = req.body;
        const userId = req.userId; // Assuming you have middleware to extract userId from the token

        // Validate required fields
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update user data (only update fields that are provided)
        if (name) user.name = name;
        if (email) {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format." });
            }
            user.email = email;
        }
        if (phone) user.phone = phone;

        // Update role-specific fields (only update fields that are provided)
        if (user.role === "municipal" && department) {
            user.department = department;
        } else if (user.role === "citizen") {
            if (address) user.address = address;
            if (location) user.location = location;
        } else if (user.role === "driver") {
            if (license) user.license = license;
            if (vehicle) user.vehicle = vehicle;
        }

        // Update password if provided
        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({ message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character." });
            }
            user.password = password; // Password hashing is handled in the User model
        }

        // Save updated user
        await user.save();

        // Remove sensitive data from response
        const userResponse = user.toJSON();

        res.status(200).json({ message: "Profile updated successfully", user: userResponse });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});*/

module.exports = router;
