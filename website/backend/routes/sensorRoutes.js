const express = require("express");
const router = express.Router();
const SensorData = require("../models/SensorData");

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

//  Fetch Latest Sensor Data
router.get("/all", async (req, res) => {
    try {
        const latestData = await SensorData.find().sort({ timestamp: -1 }).limit(1);

        if (!latestData || latestData.length === 0) {
            return res.status(404).json({ message: "No sensor data found" });
        }

        const sensorData = [{
            binLocation: latestData[0].binLocation || "N/A",
            fillLevel: latestData[0].fillLevel !== undefined ? latestData[0].fillLevel : "N/A",
            flameDetected: latestData[0].flameDetected || false,
            timestamp: latestData[0].timestamp,
        }];

        res.status(200).json({ sensorData });

    } catch (error) {
        console.error("Error fetching sensor data:", error);
        res.status(500).json({ error: "Error fetching sensor data", details: error.message });
    }
});

module.exports = router;
