# Profile Page

The Profile page provides a comprehensive user profile management interface with tabbed navigation for different sections of user information.

## Components

### Profile.jsx (Main Component)

-   Main orchestrator component that manages the overall profile state
-   Handles tab navigation and data flow between child components
-   Integrates with the Layout component for consistent page structure

### ProfileHeader.jsx

-   Displays user avatar, name, and basic information
-   Includes a download statement button for accessing account statements
-   Shows user initials or profile picture

### ProfileTabs.jsx

-   Navigation component for switching between different profile sections
-   Provides visual indication of the currently active tab
-   Includes tabs for Personal Info, Address, Security, and Preferences

### PersonalInfoTab.jsx

-   Manages editable personal information fields
-   Includes inline editing functionality with save/cancel actions
-   Handles validation for email, phone, and other personal data
-   Fields: Name, Email, Phone, Date of Birth, SSN

### AddressTab.jsx

-   Manages editable address information
-   Provides inline editing capabilities for all address fields
-   Includes form validation and formatting
-   Fields: Street Address, City, State, ZIP Code, Country

### SecurityTab.jsx

-   Manages security settings and password changes
-   Includes password strength indicator and validation
-   Provides toggles for security features like 2FA and biometric login
-   Features secure password change form with show/hide functionality

### PreferencesTab.jsx

-   Manages user preferences and settings
-   Includes notification preferences (email, SMS, push notifications)
-   Provides display and accessibility settings (theme, language, timezone)
-   Includes privacy and data management options

## Utilities

### profileUtils.js

-   Contains mock profile data for development
-   Provides validation functions for various input types
-   Includes formatting helpers and utility functions
-   Password strength calculation and security utilities

## Features

-   **Inline Editing**: Edit fields directly with save/cancel functionality
-   **Form Validation**: Real-time validation for all input fields
-   **Security Management**: Password changes, 2FA settings, and security preferences
-   **Accessibility**: Support for reduced motion, font size adjustments, and screen readers
-   **Responsive Design**: Optimized for all screen sizes
-   **Data Privacy**: Privacy controls and data download options

## State Management

The Profile component manages all profile data in local state and passes down appropriate sections to child components. Changes are handled through callback functions that update the main state.

## Integration

The Profile page integrates with:

-   Layout component for consistent page structure
-   UI components (Card, Button, Input) for consistent styling
-   Lucide React icons for visual elements
-   Bootstrap classes for responsive design

## Usage

```jsx
import Profile from "./pages/Profile/Profile";

// Use in routing
<Route path="/profile" element={<Profile />} />;
```

The Profile page is fully self-contained and manages its own state, making it easy to integrate into any routing system.
