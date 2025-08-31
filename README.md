# IoT Waste Management System 🗑️📊

A comprehensive IoT waste management system with real-time sensor monitoring, user authentication, and role-based access control.

## 🌟 Features

- **Real-time Sensor Monitoring**: Track fill levels and flame detection
- **User Authentication**: Secure login for Municipal, Citizen, and Driver roles
- **Role-based Access**: Different permissions for different user types
- **MongoDB Integration**: Scalable data storage with MongoDB Atlas
- **Responsive Frontend**: Modern web interface with real-time updates
- **RESTful API**: Well-structured backend API

## 🚀 Live Demo

- **Frontend**: [https://iot-management.vercel.app](https://iot-management.vercel.app)

## 🏗️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel with CI/CD
- **Version Control**: Git & GitHub

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/update-profile` - Update user profile

### Sensor Data
- `GET /api/sensors/all` - Get all sensor data
- `POST /api/sensors/add` - Add new sensor data

### User Management
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `DELETE /api/users/profile` - Delete user account (protected)

### Health Check
- `GET /health` - Server health status
- `GET /` - API welcome message

## 🚀 Deployment on Vercel

This project is configured for automatic deployment on Vercel with CI/CD.

### Quick Deploy

1. **Fork this repository**
2. **Connect to Vercel** at [vercel.com](https://vercel.com)
3. **Import your forked repository**
4. **Set Environment Variables**:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/iot_waste_management
   JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
   NODE_ENV=production
   ```
5. **Deploy** - Push to main branch for automatic deployment

## 🛠️ Local Development

```bash
# Clone repository
git clone https://github.com/venev-g/IoT-waste-management.git
cd IoT-waste-management

# Install dependencies
npm install
cd website/backend && npm install

# Set up environment
cp .env.example website/backend/.env
# Edit website/backend/.env with your MongoDB Atlas connection

# Start development
npm run dev
```

## 👨‍💻 Author

**venev-g**
- GitHub: [@venev-g](https://github.com/venev-g)
