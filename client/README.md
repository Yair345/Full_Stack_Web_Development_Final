# SecureBank Frontend

A modern React-based frontend for the SecureBank application built with Vite, Redux Toolkit, and Tailwind CSS.

## Features

-   **Modern Tech Stack**: React 18, Vite, Redux Toolkit, React Router v6
-   **Responsive Design**: Tailwind CSS with mobile-first approach
-   **State Management**: Redux Toolkit for predictable state updates
-   **Authentication**: JWT-based authentication with protected routes
-   **User Roles**: Support for Customer, Manager, and Admin roles
-   **Banking Operations**: Accounts, Transactions, Transfers, Loans, Cards
-   **Real-time Updates**: WebSocket support for live notifications

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── ui/              # Reusable UI components
├── pages/               # Page components
├── store/               # Redux store and slices
├── hooks/               # Custom React hooks
├── services/            # API services
├── utils/               # Utility functions
└── App.jsx              # Main application component
```

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build
-   `npm run lint` - Run ESLint
-   `npm run lint:fix` - Fix ESLint errors

## Demo Credentials

For testing purposes, you can use these demo credentials:

-   **Customer**: customer@demo.com (any password)
-   **Manager**: manager@demo.com (any password)
-   **Admin**: admin@demo.com (any password)

## Key Technologies

-   **React 18** - Component-based UI library
-   **Vite** - Fast build tool and development server
-   **Redux Toolkit** - State management
-   **React Router v6** - Client-side routing
-   **Tailwind CSS** - Utility-first CSS framework
-   **Headless UI** - Unstyled, accessible UI components
-   **Lucide React** - Beautiful & consistent icons

## Features Implementation Status

### ✅ Completed

-   Project setup and structure
-   Authentication system with Redux
-   Responsive layout with Tailwind CSS
-   Protected routes
-   Navigation and routing
-   Dashboard with mock data
-   Accounts page with account listing
-   Basic UI components

### 🚧 In Progress

-   Transaction management
-   Money transfer functionality
-   User profile management

### 📋 Planned

-   Loan management system
-   Card management
-   Admin panel features
-   Branch management (for managers)
-   Real-time notifications
-   Advanced filtering and search
-   Report generation
-   WebSocket integration

## Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_APP_NAME="SecureBank"
VITE_APP_VERSION="1.0.0"
VITE_ENABLE_WEBSOCKETS=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is part of a Full-Stack Web Development course assignment.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
