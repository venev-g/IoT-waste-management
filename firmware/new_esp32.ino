#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ESP32Servo.h>
#include <time.h>

// **WiFi Credentials**
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// **Backend Server URL**
const char* serverUrl = "https://iot-management.vercel.app/api/sensors/add";

// **Ultrasonic Sensor Pins**
#define echoPin 13
#define trigPin 12

// **MQ-2 Gas Sensor Pin (Simulated with Button)**
#define MQ2_D0_PIN 21   // Button

// **IR Sensor Pin (Simulated with Button)**
#define IR_SENSOR_PIN 4 // Button

// **Servo Motor Setup**
Servo lidServo;
#define SERVO_PIN 32

// **Variables**
long duration;
int distance;
bool lidOpen = false;

void setup() {
  Serial.begin(115200);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(MQ2_D0_PIN, INPUT_PULLUP);   // Button with pull-up
  pinMode(IR_SENSOR_PIN, INPUT_PULLUP); // Button with pull-up

  lidServo.attach(SERVO_PIN);
  lidServo.write(0);

  connectToWiFi();
  
  //  Configure NTP time sync
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("Waiting for NTP time sync...");
  time_t now = time(nullptr);
  while (now < 100000) {
    delay(1000);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("\nTime synchronized!");

  Serial.println("Smart Waste Bin System Initialized");
}

void loop() {
  int fillLevel = 0;

  if (!lidOpen) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    duration = pulseIn(echoPin, HIGH, 20000);
    if (duration > 0) {
      distance = duration / 58.2;
      if (distance > 14) distance = 14;
      fillLevel = (1 - (float)distance / 14) * 100;
      Serial.print("Fill Level: ");
      Serial.print(fillLevel);
      Serial.println("%");
    } else {
      Serial.println("Ultrasonic sensor timeout! No echo received.");
    }
  } else {
    Serial.println("Lid is open, skipping ultrasonic measurement...");
  }

  // Gas sensor simulation
  bool flameDetected = digitalRead(MQ2_D0_PIN);
  Serial.println(flameDetected ? "No flame detected." : "Flame detected! Warning!");

  // IR sensor simulation
  int sensorValue = digitalRead(IR_SENSOR_PIN);
  if (sensorValue == LOW) {  // Button pressed
    Serial.println("Object Detected! Opening Lid...");
    lidOpen = true;
    lidServo.write(90);
    delay(5000);
    lidServo.write(0);
    Serial.println("Closing Lid...");
    lidOpen = false;
  } else {
    Serial.println("No Object Detected.");
  }

  if (WiFi.status() == WL_CONNECTED) {
    sendDataToBackend(fillLevel, flameDetected);
  } else {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }

  delay(5000);
}

void sendDataToBackend(int fillLevel, bool flameDetected) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String binLocation = "LocationA";

  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);  // Use UTC time

  char isoTimestamp[30];
  strftime(isoTimestamp, sizeof(isoTimestamp), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);

  String payload = "{";
  payload += "\"binLocation\":\"" + binLocation + "\",";
  payload += "\"fillLevel\":" + String(fillLevel) + ",";
  payload += "\"flameDetected\":" + String(!flameDetected) + ",";
  payload += "\"timestamp\":\"" + String(isoTimestamp) + "\"";
  payload += "}";

  Serial.println("Sending Data: " + payload);

  int httpResponseCode = http.POST(payload);
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Data Sent Successfully: " + response);
  } else {
    Serial.print("Error sending data. HTTP code: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

void connectToWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.disconnect();
  WiFi.begin(ssid, password);

  int attempt = 0;
  while (WiFi.status() != WL_CONNECTED && attempt < 20) {
    delay(1000);
    Serial.print(".");
    attempt++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi.");
  }
}
