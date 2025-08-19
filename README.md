# 🏦 SecureBank - Full Stack Banking Application

A comprehensive full-stack banking application built with modern technologies as part of a Full-Stack Web Development course project.

## 📋 Project Overview

SecureBank is a complete banking system that simulates real-world banking operations with multiple user types, various banking features, and real-time capabilities. The application demonstrates end-to-end full-stack development skills including frontend, backend, and database integration.

## 🚀 Current Status

### ✅ Frontend Implementation (Completed)

-   **Tech Stack**: React 18, Vite, Redux Toolkit, React Router v6, Tailwind CSS
-   **Features**:
    -   Responsive design (desktop & mobile)
    -   Authentication system with protected routes
    -   Role-based navigation (Customer, Manager, Admin)
    -   Dashboard with account overview
    -   Account management interface
    -   Modern UI components library
    -   Redux state management

### 🔧 Backend Implementation (Planned)

-   **Tech Stack**: Node.js, Express.js, JWT Authentication
-   **Features**: RESTful API, Role-based access control, File uploads, WebSocket support

### 💾 Database Implementation (Planned)

-   **Primary**: MySQL for transactional data
-   **Secondary**: MongoDB for logs and documents

## 📁 Project Structure

```
Full_Stack_Web_Development_7/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Layout components (Header, Sidebar, etc.)
│   │   │   └── ui/         # Basic UI components (Button, Input, Card)
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main application component
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies and scripts
│   └── README.md           # Frontend documentation
├── server/                 # Node.js Backend (To be implemented)
├── database/               # Database scripts and migrations (To be implemented)
└── docs/                   # Project documentation (To be implemented)
```

## 🎯 User Roles & Features

### 👤 Customer Features

-   View account balances and details
-   Transaction history
-   Money transfers
-   Bill payments
-   Loan applications
-   Card management

### 👨‍💼 Branch Manager Features

-   All customer features
-   View branch customers
-   Approve/reject loan applications
-   Monitor branch transactions

### 🔧 System Administrator Features

-   All manager features
-   User management
-   System configuration
-   Audit logs access

## 🛠️ Technologies Used

### Frontend

-   **React 18** - Modern React with hooks and functional components
-   **Vite** - Fast build tool and development server
-   **Redux Toolkit** - Predictable state management
-   **React Router v6** - Client-side routing
-   **Tailwind CSS** - Utility-first CSS framework
-   **Headless UI** - Unstyled, accessible components
-   **Lucide React** - Beautiful icons

### Planned Backend

-   **Node.js** - JavaScript runtime
-   **Express.js** - Web application framework
-   **JWT** - Authentication tokens
-   **bcrypt** - Password hashing
-   **MySQL** - Primary database
-   **MongoDB** - Secondary database for logs

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   Git

### Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd Full_Stack_Web_Development_7
```

2. **Setup Frontend**

```bash
cd client
npm install
npm run dev
```

3. **Access the application**

-   Open your browser and navigate to `http://localhost:5173`
-   Use demo credentials: customer@demo.com, manager@demo.com, or admin@demo.com (any password)

## 🔑 Demo Credentials

For testing the frontend application:

| Role     | Email             | Password     |
| -------- | ----------------- | ------------ |
| Customer | customer@demo.com | any password |
| Manager  | manager@demo.com  | any password |
| Admin    | admin@demo.com    | any password |

## 📱 Features Implemented

### ✅ Current Features

-   [x] Responsive layout (desktop & mobile)
-   [x] User authentication with mock login
-   [x] Role-based navigation
-   [x] Dashboard with account overview
-   [x] Account listing and details
-   [x] Protected routes
-   [x] Redux state management
-   [x] Modern UI components

### 🚧 In Development

-   [ ] Transaction management
-   [ ] Money transfer functionality
-   [ ] User profile management
-   [ ] Advanced filtering and search

### 📋 Planned Features

-   [ ] Backend API integration
-   [ ] Real authentication system
-   [ ] Database integration
-   [ ] Loan management system
-   [ ] Card management
-   [ ] Admin panel features
-   [ ] Real-time notifications
-   [ ] WebSocket integration
-   [ ] Payment gateway integration

## 🎓 Learning Objectives

This project demonstrates proficiency in:

-   ✅ **Frontend Development**: Modern React ecosystem with hooks, state management, and routing
-   ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
-   ✅ **State Management**: Redux Toolkit for complex application state
-   ✅ **Code Organization**: Modular architecture and clean code practices
-   🔄 **Backend Development**: RESTful APIs, authentication, and security
-   🔄 **Database Design**: Relational and NoSQL database integration
-   🔄 **Security**: Authentication, authorization, and data protection
-   🔄 **Testing**: Unit and integration testing
-   🔄 **Deployment**: Production deployment and DevOps practices

## 📄 Documentation

-   [Frontend README](./client/README.md) - Detailed frontend documentation
-   [Backend README](./server/README.md) - Backend documentation (To be created)
-   [Database Schema](./database/README.md) - Database documentation (To be created)
-   [API Documentation](./docs/api.md) - API endpoints documentation (To be created)

## 🤝 Contributing

This is an educational project. Contributions and suggestions are welcome for learning purposes.

## 📝 License

This project is part of a Full-Stack Web Development course assignment.

---

**Note**: This is an ongoing educational project. The frontend is fully functional with mock data, while backend and database implementations are planned for future phases.

**Current Phase**: Frontend Development ✅ Complete
**Next Phase**: Backend API Development 🔄 In Planning
