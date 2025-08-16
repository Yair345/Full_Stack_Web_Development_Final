# Register Components

This directory contains the Register page components following the project's modular architecture pattern.

## Components Overview

### Main Component

-   **Register.jsx** - Main registration page component that orchestrates all child components and handles state management

### UI Components

-   **RegisterHeader.jsx** - Displays the SecureBank logo, title, and welcome message for registration
-   **RegisterForm.jsx** - Handles the registration form with comprehensive validation
-   **RegisterActions.jsx** - Provides navigation link back to login page

### Utilities

-   **registerUtils.js** - Contains utility functions for registration operations:
    -   `validateRegisterForm(formData)` - Comprehensive form validation
    -   `createRegisteredUser(formData)` - Creates new user object from form data
    -   `generateMockToken()` - Generates mock JWT token
    -   `simulateRegistrationDelay(ms)` - Simulates API call delay
    -   `checkEmailExists(email)` - Checks if email is already registered
    -   `getInitialFormState()` - Returns initial form state

## Component Structure

```
Register/
├── Register.jsx              # Main component
├── RegisterHeader.jsx        # Header with branding
├── RegisterForm.jsx          # Registration form
├── RegisterActions.jsx       # Additional actions
├── registerUtils.js          # Utility functions
├── index.js                  # Clean exports
└── README.md                 # This file
```

## Features

-   **Comprehensive Form Validation**:

    -   First/Last name validation
    -   Email format validation
    -   Phone number validation
    -   Age verification (18+ requirement)
    -   Strong password requirements
    -   Password confirmation matching
    -   Terms acceptance requirement

-   **User Experience**:

    -   Real-time error clearing on input
    -   Password visibility toggles
    -   Loading states during submission
    -   Responsive design
    -   Auto-login after successful registration

-   **Security Features**:
    -   Email uniqueness checking
    -   Strong password requirements (uppercase, lowercase, number, min 8 chars)
    -   Form validation both client-side and on submission

## Form Fields

1. **First Name** - Required, minimum 2 characters
2. **Last Name** - Required, minimum 2 characters
3. **Email** - Required, valid email format, uniqueness check
4. **Phone Number** - Required, valid phone format
5. **Date of Birth** - Required, must be 18+ years old
6. **Password** - Required, minimum 8 characters, must contain uppercase, lowercase, and number
7. **Confirm Password** - Required, must match password
8. **Terms Acceptance** - Required checkbox

## Integration

The Register component integrates with:

-   Redux store for authentication state
-   React Router for navigation
-   Same styling system as Login page
-   Auto-redirect logic for authenticated users

## Usage

Add to your routing configuration:

```jsx
import Register from "./pages/Register";

// In your routes
<Route path="/register" element={<Register />} />;
```
