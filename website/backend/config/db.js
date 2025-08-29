const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s if no connection
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error(" MongoDB Connection Error:", error.message);
        process.exit(1); // Stop the server if DB fails to connect
    }
};
// Event Listeners for Connection Stability
mongoose.connection.on("disconnected", () => {
    console.log(" MongoDB Disconnected! Trying to reconnect...");
    connectDB(); // Reconnect automatically
  });
  
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB Error:", err);
  });

module.exports = connectDB;

