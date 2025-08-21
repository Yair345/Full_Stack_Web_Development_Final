# 🏦 SecureBank - Full Stack Banking Application

A comprehensive full-stack banking application built with modern technologies featuring real banking operations, multiple user roles, loan management, stock trading, and real-time capabilities. This project demonstrates professional-level full-stack development skills with complete frontend, backend, and database integration.

## 📋 Project Overview

SecureBank is a complete banking ecosystem that simulates real-world banking operations with sophisticated features including branch management, loan processing, stock trading, card management, and comprehensive admin panels. The application serves different user types with role-based access control and real-time transaction processing.

## 🚀 Current Status

### ✅ Full-Stack Implementation (Completed)

**Frontend**: React 18, Vite, Redux Toolkit, React Router v6, Bootstrap
**Backend**: Node.js, Express.js, JWT Authentication, WebSocket (Socket.io)
**Database**: MySQL (Primary), MongoDB (Secondary for logs and documents)

### 🌟 Fully Implemented Features

#### 🔐 Authentication & Authorization
-   JWT-based authentication with refresh tokens
-   Role-based access control (Customer, Manager, Admin)
-   Email verification and password reset
-   Secure session management

#### 🏦 Core Banking Features
-   Multiple account types (Checking, Savings, Business)
-   Real-time balance updates
-   Internal and external transfers
-   Transaction history with advanced filtering
-   Account statements and reporting

#### 💳 Card Management
-   Debit and credit card issuance
-   Card activation and deactivation
-   Transaction limits and controls
-   Card usage analytics

#### 🏢 Branch Management System
-   Branch performance analytics
-   Customer management for branch staff
-   Cash deposit processing
-   Loan application review and approval
-   Branch-specific reporting

#### 💰 Loan Management System
-   Comprehensive loan application process
-   Multiple loan types (Personal, Business, Mortgage)
-   Credit score evaluation
-   Automated approval workflow
-   Payment processing and scheduling
-   Loan disbursement to checking accounts

#### 📈 Stock Trading Platform
-   Real-time stock data integration
-   Portfolio management
-   Buy/sell order processing
-   Watchlist functionality
-   Stock transaction history
-   Market analytics and charts

#### � Administrative Panel
-   User management (Create, Read, Update, Delete)
-   Branch administration
-   System configuration
-   Audit logs and monitoring
-   Risk management tools

#### 🔄 Real-time Features
-   WebSocket integration for live updates
-   Real-time balance notifications
-   Transaction status updates
-   Stock price streaming
-   Admin notifications

## 📁 Project Structure

```
Full_Stack_Web_Development_Final/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Layout components (Header, Sidebar, etc.)
│   │   │   └── ui/         # Basic UI components (Button, Input, Card)
│   │   ├── pages/          # Feature-specific page components
│   │   │   ├── Accounts/   # Account management pages
│   │   │   ├── AdminPanel/ # System administration
│   │   │   ├── BranchManagement/ # Branch operations
│   │   │   ├── Cards/      # Card management
│   │   │   ├── Dashboard/  # User dashboard
│   │   │   ├── Loans/      # Loan applications and management
│   │   │   ├── Profile/    # User profile management
│   │   │   ├── Stocks/     # Stock trading platform
│   │   │   ├── Transactions/ # Transaction history
│   │   │   └── Transfer/   # Money transfers
│   │   ├── store/          # Redux store and slices
│   │   ├── hooks/          # Custom React hooks and API hooks
│   │   ├── services/       # API services and external integrations
│   │   └── utils/          # Utility functions and helpers
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js Backend Application
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Request handlers for all features
│   │   ├── middleware/     # Authentication, validation, security
│   │   ├── models/         # Database models (Sequelize ORM)
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Server utilities and helpers
│   │   └── websocket/      # Real-time WebSocket configuration
│   ├── logs/              # Application logs
│   ├── scripts/           # Database migration and seeding scripts
│   └── package.json       # Backend dependencies
└── README.md              # This documentation
```

## 🎯 User Roles & Implemented Features

### 👤 Customer Features (Fully Implemented)
-   ✅ Account balance and transaction history viewing
-   ✅ Money transfers (internal and external)
-   ✅ Loan applications with real-time status tracking
-   ✅ Card management (activation, limits, usage tracking)
-   ✅ Stock trading (buy/sell orders, portfolio management)
-   ✅ Profile management and preferences
-   ✅ Real-time notifications for account activities

### 👨‍💼 Branch Manager Features (Fully Implemented)
-   ✅ All customer features plus management capabilities
-   ✅ Branch customer management and oversight
-   ✅ Loan application review and approval/rejection
-   ✅ Cash deposit processing for customer accounts
-   ✅ Branch performance analytics and reporting
-   ✅ Customer support and account assistance
-   ✅ Branch-specific transaction monitoring

### 🔧 System Administrator Features (Fully Implemented)
-   ✅ Complete user management (CRUD operations)
-   ✅ Branch administration and configuration
-   ✅ System-wide transaction monitoring
-   ✅ Audit logs and security monitoring
-   ✅ Financial reporting and analytics
-   ✅ Risk management and compliance tools
-   ✅ System configuration and maintenance

## 🛠️ Technologies Used

### Frontend Stack
-   **React 18** - Modern React with hooks and functional components
-   **Vite** - Fast build tool and development server
-   **Redux Toolkit** - Predictable state management with modern Redux patterns
-   **React Router v6** - Client-side routing with protected routes
-   **Bootstrap 5** - Responsive CSS framework with custom styling
-   **Lucide React** - Beautiful and consistent icon library
-   **Socket.io Client** - Real-time WebSocket communication

### Backend Stack
-   **Node.js** - JavaScript runtime environment
-   **Express.js** - Web application framework with middleware
-   **Sequelize ORM** - MySQL object-relational mapping
-   **MongoDB/Mongoose** - NoSQL database for logs and documents
-   **Socket.io** - Real-time bidirectional communication
-   **JWT** - JSON Web Token authentication
-   **bcrypt** - Password hashing and security
-   **Winston** - Comprehensive logging system
-   **Helmet.js** - Security middleware for Express
-   **Express Rate Limit** - Rate limiting middleware

### Database Systems
-   **MySQL** - Primary relational database for transactional data
-   **MongoDB** - Secondary database for logs and document storage
-   **Redis** - Session storage and caching (optional)

### Security & Authentication
-   **JWT Tokens** - Access and refresh token system
-   **bcrypt** - Password hashing with salt
-   **CORS** - Cross-origin resource sharing configuration
-   **Rate Limiting** - API rate limiting and brute force protection
-   **Input Validation** - Request validation and sanitization
-   **SQL Injection Prevention** - Parameterized queries via Sequelize

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   MySQL (v8.0 or higher)
-   MongoDB (v5.0 or higher) - Optional for logging
-   npm or yarn package manager
-   Git

### Complete Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd Full_Stack_Web_Development_Final
```

2. **Backend Setup**

```bash
cd server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and configuration

# Setup MySQL database
mysql -u root -p
CREATE DATABASE banking_app;
exit;

# Start the backend server
npm run dev
```

3. **Frontend Setup**

```bash
cd ../client
npm install

# Start the frontend development server
npm run dev
```

4. **Access the application**

-   Frontend: `http://localhost:5173`
-   Backend API: `http://localhost:5000`
-   API Documentation: `http://localhost:5000/api/v1/health`

### Environment Configuration

Create a `.env` file in the server directory with the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=banking_app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Optional: Email Configuration for notifications
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

## 🔑 Demo Credentials

For testing the application with different user roles:

| Role             | Email             | Password     | Access Level |
| ---------------- | ----------------- | ------------ | ------------ |
| Customer         | customer@demo.com | demo123      | Basic banking features |
| Branch Manager   | manager@demo.com  | demo123      | Branch management + customer features |
| System Admin     | admin@demo.com    | demo123      | Full system access |

**Note**: These are demo accounts. In production, use the registration system to create new accounts.

## 📱 Features Implemented

### ✅ Fully Operational Features

#### Core Banking
-   [x] User authentication with JWT tokens
-   [x] Role-based access control (Customer/Manager/Admin)
-   [x] Account management (multiple account types)
-   [x] Real-time balance updates
-   [x] Transaction processing (deposits, withdrawals, transfers)
-   [x] Transaction history with filtering and search
-   [x] Account statements and reporting

#### Advanced Features
-   [x] **Loan Management System**
    -   Complete application process
    -   Credit evaluation and approval workflow
    -   Payment processing and scheduling
    -   Branch manager approval system
-   [x] **Stock Trading Platform**
    -   Real-time stock data integration
    -   Portfolio management and tracking
    -   Buy/sell order processing
    -   Watchlist and market analytics
-   [x] **Card Management**
    -   Card issuance and activation
    -   Transaction limits and controls
    -   Usage tracking and analytics
-   [x] **Branch Management System**
    -   Customer management for branch staff
    -   Loan application review and processing
    -   Cash deposit capabilities
    -   Performance analytics and reporting
-   [x] **Administrative Panel**
    -   Complete user management (CRUD)
    -   System configuration and monitoring
    -   Audit logs and security tracking
    -   Financial reporting and analytics

#### Technical Features
-   [x] Real-time WebSocket communication
-   [x] Responsive design (mobile and desktop)
-   [x] Security features (rate limiting, validation, encryption)
-   [x] Comprehensive error handling and logging
-   [x] API documentation and testing endpoints
-   [x] Database migrations and seeding scripts

### 🔄 Continuous Improvements

-   [x] Performance optimization and caching
-   [x] Enhanced security measures
-   [x] Improved user experience and accessibility
-   [x] Extended testing coverage
-   [x] Documentation and deployment guides

## 🎓 Learning Objectives Achieved

This comprehensive project demonstrates mastery in:

### ✅ **Full-Stack Development**
-   **Frontend**: Advanced React ecosystem with hooks, context, and modern state management
-   **Backend**: Professional Node.js/Express API with proper architecture
-   **Database**: Multi-database integration (MySQL + MongoDB) with ORM/ODM
-   **Integration**: Seamless frontend-backend communication with real-time features

### ✅ **Software Architecture**
-   **MVC Pattern**: Clear separation of concerns in backend architecture
-   **Component Architecture**: Reusable and maintainable React components
-   **Service Layer**: Business logic separation and API service organization
-   **State Management**: Advanced Redux patterns with RTK Query integration

### ✅ **Security Implementation**
-   **Authentication**: JWT-based authentication with refresh token rotation
-   **Authorization**: Role-based access control with protected routes
-   **Data Protection**: Input validation, SQL injection prevention, XSS protection
-   **Security Headers**: Helmet.js implementation and CORS configuration

### ✅ **Database Design & Management**
-   **Relational Design**: Proper MySQL schema with relationships and constraints
-   **NoSQL Integration**: MongoDB for logging and document storage
-   **ORM Mastery**: Advanced Sequelize usage with migrations and associations
-   **Query Optimization**: Efficient database queries and indexing strategies

### ✅ **Real-time & Advanced Features**
-   **WebSocket Implementation**: Socket.io for real-time communication
-   **API Integration**: External stock market API integration
-   **File Handling**: Secure file upload and processing
-   **Background Jobs**: Automated processes and scheduled tasks

### ✅ **DevOps & Production Readiness**
-   **Environment Configuration**: Proper environment variable management
-   **Logging**: Comprehensive logging system with Winston
-   **Error Handling**: Global error handling and recovery strategies
-   **Testing**: API testing and validation frameworks

## 📄 Documentation

-   [Frontend Documentation](./client/README.md) - Detailed frontend architecture and components
-   [Backend Documentation](./server/README.md) - Complete API documentation and server setup
-   [Branch Management Guide](./client/src/pages/BranchManagement/README.md) - Branch operations documentation
-   [Stock Trading Guide](./client/src/pages/Stocks/README.md) - Stock platform documentation
-   [Transaction System Guide](./client/src/pages/Transactions/README.md) - Transaction processing documentation

## 🏗️ Architecture Highlights

### Backend Architecture
-   **RESTful API Design**: Properly structured endpoints with HTTP status codes
-   **Middleware Stack**: Authentication, validation, rate limiting, and error handling
-   **Database Models**: Comprehensive relational models with proper associations
-   **Service Layer**: Business logic separation for maintainability
-   **Real-time Engine**: WebSocket integration for live updates

### Frontend Architecture
-   **Component Library**: Reusable UI components with consistent styling
-   **State Management**: Redux Toolkit with API state management
-   **Routing System**: Protected routes with role-based access
-   **Hook System**: Custom hooks for API calls and business logic
-   **Service Integration**: Abstracted API services with error handling

### Security Implementation
-   **Authentication Flow**: JWT tokens with automatic refresh
-   **Input Validation**: Server-side validation with Express Validator
-   **Rate Limiting**: API rate limiting to prevent abuse
-   **CORS Configuration**: Proper cross-origin resource sharing setup
-   **Data Encryption**: Sensitive data encryption for database storage

## 🚀 Production Features

### Performance Optimizations
-   **Caching Strategy**: Redis integration for session management
-   **Database Optimization**: Indexed queries and connection pooling
-   **Frontend Optimization**: Code splitting and lazy loading
-   **Asset Optimization**: Compressed images and minified code

### Monitoring & Logging
-   **Comprehensive Logging**: Winston-based logging system
-   **Error Tracking**: Global error handling with detailed reporting
-   **Performance Monitoring**: Request timing and database query optimization
-   **Audit Trail**: Complete transaction and user action logging

## 🤝 Contributing

This project demonstrates professional full-stack development practices and is open for educational review and enhancement suggestions.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
-   ESLint configuration for consistent code formatting
-   Proper error handling and validation
-   Comprehensive commenting and documentation
-   Security best practices implementation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   **Educational Purpose**: Developed as part of Full-Stack Web Development coursework
-   **Industry Standards**: Implemented using current industry best practices
-   **Real-world Application**: Designed to simulate actual banking system requirements
-   **Modern Technologies**: Utilizing cutting-edge development tools and frameworks

---

## 📊 Project Statistics

-   **Lines of Code**: 15,000+ (Frontend: ~8,000, Backend: ~7,000)
-   **Components**: 50+ React components
-   **API Endpoints**: 40+ RESTful endpoints
-   **Database Models**: 12 primary models with relationships
-   **Features**: 8 major feature modules implemented
-   **User Roles**: 3 distinct user types with different access levels

**Development Status**: ✅ **Production Ready**

This application represents a complete, production-ready banking system with comprehensive features, security implementations, and professional-grade architecture suitable for real-world deployment.

**Technology Demonstration**: Full-Stack Web Development mastery with modern technologies, security practices, and scalable architecture design.
