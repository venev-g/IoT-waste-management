const express = require("express");
const router = express.Router();
const SensorData = require("../models/sensorData");

// Insert Sensor Data (via HTTP POST)
router.post("/add", async (req, res) => {
    try {
        const {
            binLocation,
            fillLevel,
            flameDetected,
            timestamp // This could be undefined or invalid
        } = req.body;

        if (!binLocation || fillLevel === undefined || flameDetected === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        //  Use current timestamp if not provided or invalid (supports ISO or Unix)
        const parsedTimestamp = (timestamp && !isNaN(new Date(timestamp).getTime()))
            ? new Date(timestamp)
            : new Date();

        const newData = new SensorData({
            binLocation,
            fillLevel,
            flameDetected,
            timestamp: parsedTimestamp
        });

        await newData.save();

        res.status(201).json({ message: "Sensor data added successfully", data: newData });
    } catch (error) {
        console.error("Error adding sensor data:", error);
        res.status(500).json({ error: "Error adding sensor data", details: error.message });
    }
});

//  Fetch All Sensor Data (Modified to return all data, not just latest)
router.get("/all", async (req, res) => {
    try {
        // Fetch all sensor data, sorted by timestamp (newest first)
        const allData = await SensorData.find().sort({ timestamp: -1 });

        // If no data found, return empty array instead of 404
        if (!allData || allData.length === 0) {
            return res.status(200).json({ sensorData: [] });
        }

        // Format the data for frontend
        const sensorData = allData.map(sensor => ({
            binLocation: sensor.binLocation || "N/A",
            fillLevel: sensor.fillLevel !== undefined ? sensor.fillLevel : "N/A",
            flameDetected: sensor.flameDetected || false,
            timestamp: sensor.timestamp,
        }));

        res.status(200).json({ sensorData });

    } catch (error) {
        console.error("Error fetching sensor data:", error);
        res.status(500).json({ 
            error: "Error fetching sensor data", 
            details: error.message,
            sensorData: [] // Return empty array on error for frontend compatibility
        });
    }
});

module.exports = router;
