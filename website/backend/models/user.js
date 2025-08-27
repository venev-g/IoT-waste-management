const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

if (mongoose.models.User) {
    module.exports = mongoose.model("User");
} else {
    const userSchema = new mongoose.Schema(
        {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            email: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                lowercase: true,
                match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                validate: {
                    validator: async function (email) {
                        const user = await this.constructor.findOne({ email });
                        return !user || this._id.equals(user._id);
                    },
                    message: "Email already exists.",
                },
            },
            phone: {
                type: String,
                required: true,
                trim: true,
                validate: {
                    validator: function (value) {
                        return /^\+?[0-9]{10,15}$/.test(value);
                    },
                    message: "Invalid phone number.",
                },
            },
            address: {
                type: String,
                required: function () {
                    return this.role === "citizen";
                },
                trim: true,
            },
            location: {
                type: String,
                required: function () {
                    return this.role === "citizen";
                },
                trim: true,
            },
            role: {
                type: String,
                enum: ["citizen", "driver", "municipal"],
                required: true,
            },
            department: {
                type: String,
                required: function () {
                    return this.role === "municipal";
                },
                trim: true,
            },
            license: {
                type: String,
                required: function () {
                    return this.role === "driver";
                },
                trim: true,
            },
            vehicle: {
                type: String,
                required: function () {
                    return this.role === "driver";
                },
                trim: true,
            },
            password: {
                type: String,
                required: true,
                minlength: 8,
            },
        },
        { timestamps: true }
    );

    // Password hashing middleware (Critical Fix)
    userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) return next();
        
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    });

    // Password comparison method (Critical Fix)
    userSchema.methods.matchPassword = async function (enteredPassword) {
        try {
            const trimmedPassword = enteredPassword.trim();
            return await bcrypt.compare(trimmedPassword, this.password);
        } catch (error) {
            console.error("Password comparison error:", error);
            return false;
        }
    };

    // Remove sensitive data from response
    userSchema.methods.toJSON = function () {
        const user = this.toObject();
        delete user.password;
        delete user.__v;
        return user;
    };

    module.exports = mongoose.model("User", userSchema);
}
