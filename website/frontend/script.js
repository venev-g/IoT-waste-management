const BASE_URL = "http://localhost:5001"; // Ensure this matches your backend server URL

// Show Login Page
function showLogin() {
    console.log("Showing Login Page");
    document.querySelectorAll(".container").forEach(div => (div.style.display = "none"));
    document.getElementById("login-page").style.display = "block";
    document.getElementById("logout-btn").style.display = "none"; // Hide logout button
    document.getElementById("login-error").style.display = "none"; // Hide login error message
}

// Show Registration Page
function showRegister() {
    console.log("Showing Register Page");
    document.querySelectorAll(".container").forEach(div => (div.style.display = "none"));
    document.getElementById("register-page").style.display = "block";
    document.getElementById("logout-btn").style.display = "none"; // Hide logout button
    document.getElementById("register-error").style.display = "none"; // Hide registration error message
    updateRegistrationFields(); // Load role-specific fields
}

// Update Registration Fields Based on Selected Role
function updateRegistrationFields() {
    const role = document.getElementById("register-role").value;
    let extraFieldsHTML = "";

    if (role === "municipal") {
        extraFieldsHTML = `
            <label for="department">Department:</label>
            <input type="text" id="department" placeholder="Enter Department" required>
        `;
    } else if (role === "citizen") {
        extraFieldsHTML = `
            <label for="address">Address:</label>
            <input type="text" id="address" placeholder="Enter Address" required>
            <label for="location">Location:</label>
            <input type="text" id="location" placeholder="Enter Location" required>
        `;
    } else if (role === "driver") {
        extraFieldsHTML = `
            <label for="license">License Number:</label>
            <input type="text" id="license" placeholder="Enter License Number" required>
            <label for="vehicle">Vehicle Number:</label>
            <input type="text" id="vehicle" placeholder="Enter Vehicle Number" required>
        `;
    }

    document.getElementById("extra-fields").innerHTML = extraFieldsHTML;
}

// Validate Password Strength
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Validate Email Format
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Register User
async function register() {
    const role = document.getElementById("register-role").value;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // Clear previous error messages
    document.getElementById("register-error").style.display = "none";

    if (!validateEmail(email)) {
        document.getElementById("register-error").textContent = "Please enter a valid email address.";
        document.getElementById("register-error").style.display = "block";
        return;
    }

    if (!validatePassword(password)) {
        document.getElementById("register-error").textContent = "Password must be strong (include uppercase, lowercase, numbers, and special characters).";
        document.getElementById("register-error").style.display = "block";
        return;
    }

    let userData = { role, name, email, password, phone };

    if (role === "municipal") {
        userData.department = document.getElementById("department").value.trim();
    } else if (role === "citizen") {
        userData.address = document.getElementById("address").value.trim();
        userData.location = document.getElementById("location").value.trim();
    } else if (role === "driver") {
        userData.license = document.getElementById("license").value.trim();
        userData.vehicle = document.getElementById("vehicle").value.trim();
    }

    try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            document.getElementById("register-error").textContent = errorData.message || "Registration failed. Please check your input and try again.";
            document.getElementById("register-error").style.display = "block";
            return;
        }

        const data = await response.json();
        console.log("Response:", data);
        alert("Registration successful! Please login.");
        showLogin();
    } catch (error) {
        console.error("Registration error:", error);
        document.getElementById("register-error").textContent = "An error occurred. Please try again.";
        document.getElementById("register-error").style.display = "block";
    }
}

// Login User
async function login() {
    const role = document.getElementById("role-selection").value;
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    // Clear previous error messages
    document.getElementById("login-error").style.display = "none";

    if (!email || !password || !role) {
        document.getElementById("login-error").textContent = "Please enter both email and password and select a role.";
        document.getElementById("login-error").style.display = "block";
        return;
    }

    if (!validateEmail(email)) {
        document.getElementById("login-error").textContent = "Please enter a valid email address.";
        document.getElementById("login-error").style.display = "block";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            document.getElementById("login-error").textContent = errorData.message || "Invalid email or password.";
            document.getElementById("login-error").style.display = "block";
            return;
        }

        const data = await response.json();
        console.log("Response:", data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user data
        alert("Login successful!");
        showDashboard();
    } catch (error) {
        console.error("Login error:", error);
        document.getElementById("login-error").textContent = "An error occurred. Please try again.";
        document.getElementById("login-error").style.display = "block";
    }
}

// Show Dashboard
function showDashboard() {
    console.log("Showing Dashboard");
    document.querySelectorAll(".container").forEach(div => (div.style.display = "none"));
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("logout-btn").style.display = "block"; // Show logout button
    fetchSensorData(); // Fetch and display sensor data
}

window.onload = function () {
    fetchSensorData();
    setInterval(fetchSensorData, 5000); // Fetch and update every 5 seconds
};
async function fetchSensorData() {
    try {
        const sensorTableBody = document.getElementById("sensorTableBody");

        //  Ensure table exists in the DOM
        if (!sensorTableBody) {
            console.error("Sensor table element not found in the DOM!");
            return;
        }

        const response = await fetch(`${BASE_URL}/api/sensors/all`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        //  Extract sensor data only
        const sensorDataArray = data.sensorData || [];

        console.log("Fetched Sensor Data:", sensorDataArray);

        if (!Array.isArray(sensorDataArray)) {
            console.error("Unexpected API response format:", data);
            return;
        }

        //  Update Sensor Table
        sensorTableBody.innerHTML = "";
        sensorDataArray.forEach((sensor, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${sensor.binLocation || "N/A"}</td>
                <td>${sensor.fillLevel !== undefined ? sensor.fillLevel + "%" : "N/A"}</td>
                <td>${sensor.flameDetected ? "Yes" : "No"}</td>
                <td>${sensor.timestamp ? new Date(sensor.timestamp).toLocaleString() : "N/A"}</td>
            `;
            sensorTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching sensor data:", error);
        alert("Failed to fetch sensor data. Please check the backend.");
    }
}

// Fetch data immediately on page load
window.onload = () => {
    fetchSensorData();
    setInterval(fetchSensorData, 5000); //  Poll every 5 seconds for real-time updates
};



// Logout User
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user"); // Remove user data
    showLogin();
}

// Show Edit Profile Form
/**function showEditProfile() {
    console.log("Showing Edit Profile Form");
    document.querySelectorAll(".container").forEach(div => (div.style.display = "none"));
    document.getElementById("edit-profile").style.display = "block";

    // Fetch user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Populate the edit form
    document.getElementById("edit-name").value = user.name;
    document.getElementById("edit-email").value = user.email;
    document.getElementById("edit-phone").value = user.phone;
    document.getElementById("edit-password").value = ""; // Clear password field

    // Show role-specific fields
    const extraFields = document.getElementById("edit-extra-fields");
    extraFields.innerHTML = "";
    if (user.role === "citizen") {
        extraFields.innerHTML = `
            <label for="edit-address">Address:</label>
            <input type="text" id="edit-address" placeholder="Enter Address" value="${user.address || ""}">
            <label for="edit-location">Location:</label>
            <input type="text" id="edit-location" placeholder="Enter Location" value="${user.location || ""}">
        `;
    } else if (user.role === "municipal") {
        extraFields.innerHTML = `
            <label for="edit-department">Department:</label>
            <input type="text" id="edit-department" placeholder="Enter Department" value="${user.department || ""}">
        `;
    } else if (user.role === "driver") {
        extraFields.innerHTML = `
            <label for="edit-license">License:</label>
            <input type="text" id="edit-license" placeholder="Enter License" value="${user.license || ""}">
            <label for="edit-vehicle">Vehicle:</label>
            <input type="text" id="edit-vehicle" placeholder="Enter Vehicle" value="${user.vehicle || ""}">
        `;
    }
}

// Update Profile
async function updateProfile() {
    // Retrieve stored user object (which should include _id)
    const user = JSON.parse(localStorage.getItem("user"));
    // Include _id in the update payload
    const updatedData = {
        _id: user._id, // Add the user's unique identifier
        name: document.getElementById("edit-name").value,
        email: document.getElementById("edit-email").value,
        phone: document.getElementById("edit-phone").value,
    };

    // Add role-specific fields if necessary
    if (user.role === "citizen") {
        updatedData.address = document.getElementById("edit-address").value;
        updatedData.location = document.getElementById("edit-location").value;
    } else if (user.role === "municipal") {
        updatedData.department = document.getElementById("edit-department").value;
    } else if (user.role === "driver") {
        updatedData.license = document.getElementById("edit-license").value;
        updatedData.vehicle = document.getElementById("edit-vehicle").value;
    }

    // Update password if provided
    const newPassword = document.getElementById("edit-password").value.trim();
    if (newPassword) {
        if (!validatePassword(newPassword)) {
            alert("Password must be strong (include uppercase, lowercase, numbers, and special characters).");
            return;
        }
        updatedData.password = newPassword;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/auth/update-profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to update profile:", errorData);
            alert(errorData.message || "Failed to update profile.");
            return;
        }

        const data = await response.json();
        console.log("Profile Update Response:", data);
        // Update the user in localStorage with the new data
        localStorage.setItem("user", JSON.stringify({ ...user, ...updatedData }));
        alert("Profile updated successfully!");
        showDashboard();
    } catch (error) {
        console.error("Profile update error:", error);
        alert("An error occurred. Please try again.");
    }
}
*/
// Initialize Page
function init() {
    showLogin(); // Show login page by default
}

// Event Listeners
document.addEventListener("DOMContentLoaded", init);
