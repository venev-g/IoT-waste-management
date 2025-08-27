# IoT-Based-Smart-Waste-Management-System
An IoT-based smart waste management system using ESP32, ultrasonic and smoke sensors, with a web dashboard and MongoDB integration. It detects bin fill levels and smoke in real time and displays on a website which has a user-friendly interface with login authentication.

## Features

-  Real-time bin level detection via ultrasonic sensor
-  Smoke/gas detection for safety alerts using MQ-2 gas sensor
-  Automatic lid opening using IR proximity sensor and servo motor for touchless waste disposal.
-  Web dashboard with live monitoring
-  User login using Email
-  MongoDB cloud database storage
-  ML model to predict fill levels more accurately

## Tech Stack

| Layer           |    Technologies                |
|---------------  |--------------------------------|
| Microcontroller | ESP32 (Arduino IDE)            |
| Sensors         | HC-SR04 (Ultrasonic), MQ-2     |
| Actuator        | MG90S Servo Motor              |
| Frontend        | HTML, CSS, JavaScript          |
| Backend         | Node.js                        |
| Database        | MongoDB                        |
| Auth            | Email-Password Login           |
| ML              | GradientBoostingRegressor      |


## Folder Structure
```
├── firmware/
|    └──  esp32.uno
|
├── hardware/
│   ├── ESP32.png
│   ├── HC SR04 Ultrasonic sensor.png
│   ├── IR proximity sensor.png
│   ├── MG90S Servo motor.png
|   ├── MQ-2 Gas sensor.png
|   └── circuit-diagram
|
├── ml_model/
│   ├── ML output.png
|   ├── ai_api.py
│   └── enhanced_bin_data.csv
│    
├── website/
│   ├── backend/
|   |   ├── config/
|   |        └──  db.js
|   |   ├── middleware/
|   |        └── authMiddleware.js
|   |   ├── models/
|   |       ├── sensorData.js
|   |       ├── user.js
|   |        └──  userRoutes.js
|   |   ├── routes/
|   |       ├── authRoutes.js
|   |       ├── sensorRoutes.js
|   |        └──  userRoutes.js
│   ├── frontend/
│   │   ├── Dashboard.png
|   |   ├── Login page_image 1.png
|   |   ├── Login page_image 2.png
|   |   ├── Registration page.png
|   |   ├── index.html
|   |   ├── script.js
│   │   └── style.css
│   
└── README.md
```



