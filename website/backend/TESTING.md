# Testing Setup Guide

## Current Status
- ✅ Test script fixed in package.json (no longer causes CI/CD failure)
- ✅ Placeholder test file created (`tests/server.test.js`)
- ✅ CI/CD workflow handles missing tests gracefully

## Future Testing Implementation

### Option 1: Jest (Recommended)
```bash
# Install Jest and testing dependencies
npm install --save-dev jest supertest

# Update package.json test script
"test": "jest"

# Add Jest configuration (optional)
"jest": {
  "testEnvironment": "node",
  "testMatch": ["**/tests/**/*.test.js"]
}
```

### Option 2: Mocha + Chai
```bash
# Install Mocha and testing dependencies
npm install --save-dev mocha chai supertest

# Update package.json test script
"test": "mocha tests/**/*.test.js"
```

### Test Coverage Areas

#### 1. API Endpoints
- Health check endpoint
- Sensor data CRUD operations
- User authentication (register/login)
- Error handling

#### 2. Database Operations
- MongoDB connection
- Data validation
- Schema compliance

#### 3. Authentication
- JWT token generation/validation
- Password hashing
- Authorization middleware

### Example Test Structure

```javascript
// tests/api.test.js
const request = require('supertest');
const app = require('../server');

describe('Sensor API', () => {
  test('GET /api/sensors/all', async () => {
    const response = await request(app).get('/api/sensors/all');
    expect(response.status).toBe(200);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (Jest)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Integration with CI/CD

The current workflow will automatically run tests when:
- Pushing to main branch
- Creating pull requests
- Tests pass = deployment proceeds
- Tests fail = deployment stops

## Next Steps

1. Choose testing framework (Jest recommended)
2. Install testing dependencies
3. Implement basic API tests
4. Add database test setup/teardown
5. Integrate with CI/CD pipeline
