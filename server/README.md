# Banking Application Server

A comprehensive Node.js/Express banking backend server with JWT authentication, real-time features, and secure transaction processing.

## 🚀 Features

-   **User Authentication & Authorization**

    -   JWT-based authentication with refresh tokens
    -   Role-based access control (customer, manager, admin)
    -   Email verification and password reset
    -   Secure password hashing with bcrypt

-   **Account Management**

    -   Multiple account types (checking, savings, business)
    -   Real-time balance updates
    -   Account statements and transaction history
    -   Account creation and management

-   **Transaction Processing**

    -   Internal and external transfers
    -   Deposits and withdrawals
    -   Transaction history and filtering
    -   Real-time transaction status updates
    -   Transaction cancellation for pending transactions

-   **Security Features**

    -   Data encryption for sensitive information
    -   Rate limiting and request validation
    -   CORS protection
    -   SQL injection prevention
    -   XSS protection with Helmet.js

-   **Real-time Communication**

    -   WebSocket support with Socket.io
    -   Live balance updates
    -   Real-time transaction notifications
    -   Admin notifications

-   **Additional Features**
    -   Comprehensive logging and error handling
    -   Email notifications
    -   API documentation ready
    -   Database migrations and seeders
    -   Environment-based configuration

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Database and app configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/          # Database models (Sequelize)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions and helpers
│   ├── websocket/       # Socket.io configuration
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── uploads/             # File upload directory
├── logs/               # Application logs
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🛠️ Installation & Setup

### Prerequisites

-   Node.js (v18 or higher)
-   MySQL (v8.0 or higher)
-   Redis (for session management)
-   Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Full_Stack_Web_Development_Final/server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=banking_app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### 4. Database Setup

```bash
# Create the database
mysql -u root -p
CREATE DATABASE banking_app;
exit;

# Run migrations (if you have them)
npm run migrate
```

### 5. Start the Server

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

#### Using the simple start script

```bash
node start.js
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone_number": "+1234567890",
  "date_of_birth": "1990-01-01",
  "address": "123 Main St, City, State"
}
```

#### Login User

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Profile

```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

### Account Endpoints

#### Get All Accounts

```http
GET /api/v1/accounts
Authorization: Bearer <access_token>
```

#### Create Account

```http
POST /api/v1/accounts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "account_type": "checking",
  "currency": "USD"
}
```

#### Get Account Balance

```http
GET /api/v1/accounts/:id/balance
Authorization: Bearer <access_token>
```

### Transaction Endpoints

#### Transfer Money

```http
POST /api/v1/transactions/transfer
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "from_account_id": 1,
  "to_account_number": "1234567890",
  "amount": 100.00,
  "description": "Payment for services"
}
```

#### Make Deposit

```http
POST /api/v1/transactions/deposit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "account_id": 1,
  "amount": 500.00,
  "description": "Salary deposit"
}
```

#### Make Withdrawal

```http
POST /api/v1/transactions/withdrawal
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "account_id": 1,
  "amount": 50.00,
  "description": "ATM withdrawal"
}
```

#### Get Transaction History

```http
GET /api/v1/transactions?page=1&limit=20&type=transfer&status=completed
Authorization: Bearer <access_token>
```

## 🔌 WebSocket Events

### Connection

```javascript
const socket = io("http://localhost:5000", {
	auth: {
		token: "your-jwt-token",
	},
});
```

### Events

#### Balance Updates

```javascript
socket.on("balance_update", (data) => {
	console.log("New balance:", data.balance);
});
```

#### Transaction Notifications

```javascript
socket.on("new_transaction", (data) => {
	console.log("New transaction:", data.transaction);
});
```

#### Join Account Room

```javascript
socket.emit("join_account", accountId);
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### API Test

```bash
# Register a new user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## 🔐 Security Features

-   **JWT Authentication**: Secure token-based authentication
-   **Rate Limiting**: Prevents brute force attacks
-   **Data Validation**: Input validation and sanitization
-   **CORS Protection**: Cross-origin request filtering
-   **Helmet.js**: Security headers
-   **Bcrypt**: Password hashing
-   **SQL Injection Prevention**: Parameterized queries with Sequelize

## 📝 Logging

Logs are stored in the `logs/` directory with different levels:

-   `error.log`: Error messages
-   `combined.log`: All log messages
-   Console output in development

## 🚀 Deployment

### Environment Variables for Production

Make sure to set secure values for:

-   `JWT_SECRET` and `JWT_REFRESH_SECRET`
-   `ENCRYPTION_KEY`
-   Database credentials
-   Gmail app password

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

-   Check the logs in `logs/` directory
-   Review the API responses for error messages
-   Ensure all environment variables are properly set
-   Verify database connection and Redis availability

## 🔄 Version History

-   **v1.0.0**: Initial release with core banking features
    -   User authentication and authorization
    -   Account management
    -   Transaction processing
    -   Real-time WebSocket communication
    -   Security features and logging
