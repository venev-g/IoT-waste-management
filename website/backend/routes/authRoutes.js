const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Strong Password Validation
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Register User (Critical Fix - removed manual hashing)
router.post("/register", async (req, res) => {
    const { role, name, email, password, phone, department, address, location, license, vehicle } = req.body;

    try {
        // Validate input
        if (!role || !name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate password strength
        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user with plain text password (hashing handled by model)
        const newUser = new User({
            role,
            name,
            email: email.trim().toLowerCase(),
            password: password.trim(),
            phone,
            department: role === "municipal" ? department : undefined,
            address: role === "citizen" ? address : undefined,
            location: role === "citizen" ? location : undefined,
            license: role === "driver" ? license : undefined,
            vehicle: role === "driver" ? vehicle : undefined,
        });

        // Save user to database
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Remove sensitive data from response
        const userResponse = { ...newUser.toObject() };
        delete userResponse.password;
        delete userResponse.__v;

        res.status(201).json({ token, role: newUser.role, user: userResponse });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
});

// Login User (Critical Fix - added proper trimming)
router.post("/login", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Trim and normalize inputs
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        // Find user by email
        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            console.log("Login attempt for non-existent email:", trimmedEmail);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Validate password
        const isPasswordValid = await user.matchPassword(trimmedPassword);
        if (!isPasswordValid) {
            console.log("Password mismatch for user:", user.email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check role
        if (user.role !== role) {
            console.log("Role mismatch for user:", user.email);
            return res.status(400).json({ message: "Invalid role" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Remove sensitive data from response
        const userResponse = { ...user.toObject() };
        delete userResponse.password;
        delete userResponse.__v;

        res.status(200).json({ token, role: user.role, user: userResponse });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

// Update User Profile (Original implementation preserved)
router.put("/update-profile", async (req, res) => {
    const { name, email, phone, department, address, location, license, vehicle, password } = req.body;
    const userId = req.userId;

    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            user.email = email;
        }
        if (phone) user.phone = phone;

        if (user.role === "municipal" && department) {
            user.department = department;
        } else if (user.role === "citizen") {
            if (address) user.address = address;
            if (location) user.location = location;
        } else if (user.role === "driver") {
            if (license) user.license = license;
            if (vehicle) user.vehicle = vehicle;
        }

        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({
                    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
                });
            }
            user.password = password.trim(); // Password hashing handled by model
        }

        await user.save();

        const userResponse = { ...user.toObject() };
        delete userResponse.password;
        delete userResponse.__v;

        res.status(200).json({ message: "Profile updated successfully", user: userResponse });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Profile update failed", error: error.message });
    }
});

module.exports = router;
