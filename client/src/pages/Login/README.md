# Login Components

This directory contains the refactored Login page components following the project's modular architecture pattern.

## Components Overview

### Main Component

-   **Login.jsx** - Main login page component that orchestrates all child components and handles state management

### UI Components

-   **LoginHeader.jsx** - Displays the SecureBank logo, title, and welcome message
-   **LoginForm.jsx** - Handles the email/password form with validation and submission
-   **DemoActions.jsx** - Provides demo login functionality and credential information

### Utilities

-   **loginUtils.js** - Contains utility functions for login operations:
    -   `createMockUser(email)` - Creates mock user data based on email
    -   `getMockToken()` - Returns mock JWT token
    -   `validateLoginForm(formData)` - Validates login form data
    -   `simulateApiDelay(ms)` - Simulates API call delay
    -   `demoCredentials` - Default demo credentials

## Component Structure

```
Login/
├── Login.jsx              # Main component
├── LoginHeader.jsx        # Header with branding
├── LoginForm.jsx          # Form component
├── DemoActions.jsx        # Demo login actions
├── loginUtils.js          # Utility functions
└── README.md              # This file
```

## Features

-   Clean separation of concerns
-   Reusable components
-   Centralized utility functions
-   Consistent with project architecture
-   Mock authentication for demo purposes
-   Password visibility toggle
-   Loading states and error handling

## Usage

The main Login component is used in the routing configuration:

```jsx
import Login from "./pages/Login/Login";
```

## Demo Credentials

-   **Customer**: customer@demo.com (any password)
-   **Manager**: manager@demo.com (any password)
-   **Admin**: admin@demo.com (any password)
