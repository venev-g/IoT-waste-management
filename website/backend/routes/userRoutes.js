const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { protect } = require("../middleware/authMiddleware");

// Strong Password Validation (Added to match authRoutes)
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// 🔹 Fetch User Profile (Protected Route) - No changes needed
router.get("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -__v");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
});

// 🔹 Update User Profile (Critical Fixes)
router.put("/profile", protect, async (req, res) => {
    try {
        const { name, email, phone, address, location, department, license, vehicle, password } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update basic fields
        if (name) user.name = name;
        
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            user.email = email.trim().toLowerCase();
        }

        if (phone) {
            const phoneRegex = /^\+?[0-9]{10,15}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({ message: "Invalid phone number" });
            }
            user.phone = phone;
        }

        // Update role-specific fields
        if (user.role === "citizen") {
            if (address) user.address = address;
            if (location) user.location = location;
        } else if (user.role === "municipal" && department) {
            user.department = department;
        } else if (user.role === "driver") {
            if (license) user.license = license;
            if (vehicle) user.vehicle = vehicle;
        }

        // Password update handling (Critical Fix)
        if (password) {
            const trimmedPassword = password.trim();
            if (!validatePassword(trimmedPassword)) {
                return res.status(400).json({ 
                    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
                });
            }
            user.password = trimmedPassword; // Let model handle hashing
        }

        await user.save();

        const updatedUser = await User.findById(req.user.id).select("-password -__v");
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: "Error updating user profile", error: error.message });
    }
});

// 🔹 Delete User Profile (Critical Fix)
router.delete("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne(); // Changed from remove() to deleteOne()

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Profile Delete Error:", error);
        res.status(500).json({ message: "Error deleting user profile", error: error.message });
    }
});

module.exports = router;
