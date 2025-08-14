# AdminPanel Page

The AdminPanel provides comprehensive system administration capabilities including user management, system monitoring, activity logging, and health monitoring.

## Components

### AdminPanel.jsx (Main Component)

-   Main orchestrator component that manages admin panel state and navigation
-   Handles data loading, tab switching, and action dispatching
-   Integrates with Layout component for consistent page structure
-   Provides loading states and error handling

### AdminHeader.jsx

-   Header component with title, description, and primary action buttons
-   Includes system settings and report generation buttons
-   Provides clear navigation and quick access to admin functions

### AdminTabs.jsx

-   Navigation component for switching between different admin sections
-   Visual indication of active tab with icons and labels
-   Includes Overview, User Management, Activity Log, and System Health tabs

### OverviewTab.jsx

-   High-level dashboard view combining multiple overview components
-   Orchestrates SystemStatsCards, SystemHealthCard, and RecentAlertsCard
-   Provides executive summary of system status

### SystemStatsCards.jsx

-   Displays key system metrics in card format
-   Shows total users, active users, transactions, and total volume
-   Includes trend indicators and comparative statistics
-   Uses dynamic coloring based on performance indicators

### SystemHealthCard.jsx

-   Comprehensive system health monitoring display
-   Shows overall system uptime percentage with visual indicator
-   Lists all system services with their current status
-   Uses color-coded status badges for quick assessment

### RecentAlertsCard.jsx

-   Displays recent system alerts and notifications
-   Categorizes alerts by type (volume, security, backup, etc.)
-   Shows alert counts and timing information
-   Provides quick access to critical system events

### UserManagementTab.jsx

-   User administration interface with search and filtering
-   Integrates UsersTable component for user display
-   Provides user creation and batch operation capabilities
-   Includes advanced filtering and search functionality

### UsersTable.jsx

-   Comprehensive user listing with detailed information
-   Shows user status, roles, account information, and risk levels
-   Includes per-user action dropdown menus
-   Supports user activation, suspension, and detailed views

### ActivityLogTab.jsx

-   System activity monitoring and logging interface
-   Displays chronological list of system events
-   Categorizes activities by type and severity
-   Includes export functionality for audit purposes

### SystemHealthTab.jsx

-   Detailed system performance and health monitoring
-   Shows server status for all system components
-   Displays performance metrics with visual progress bars
-   Provides granular system monitoring capabilities

## Utilities

### adminUtils.js

-   Contains comprehensive mock data for all admin functions
-   Provides utility functions for formatting and calculations
-   Includes badge generation functions for status and risk levels
-   Contains filtering and search utilities for user management

## Features

-   **System Monitoring**: Real-time system health and performance tracking
-   **User Management**: Comprehensive user administration with search and filtering
-   **Activity Logging**: Complete audit trail of system activities
-   **Performance Metrics**: Detailed system performance monitoring
-   **Security Oversight**: Risk assessment and security monitoring
-   **Data Export**: Report generation and log export capabilities
-   **Role-based Access**: Different views based on administrative permissions

## Data Flow

The AdminPanel manages complex administrative data through:

-   Local state for tab navigation and UI interactions
-   Mock data service for development and testing
-   Centralized action handlers for all administrative operations
-   Component-specific data passing for focused functionality

## State Management

-   **Loading States**: Manages data loading and error states
-   **Tab Navigation**: Controls active tab and content rendering
-   **Search and Filters**: Handles user search and filtering logic
-   **Action States**: Manages admin action confirmations and results

## Integration

The AdminPanel integrates with:

-   Layout component for consistent page structure
-   UI components (Card, Button, Input) for consistent styling
-   Lucide React icons for visual elements
-   Bootstrap components for responsive design and interactions
-   Mock data services for development and testing

## Security Considerations

-   **Role Verification**: Ensures only authorized users can access admin functions
-   **Action Logging**: All admin actions are logged for audit purposes
-   **Data Protection**: Sensitive user information is handled securely
-   **Access Control**: Different permission levels for different admin functions

## Usage

```jsx
import AdminPanel from "./pages/AdminPanel/AdminPanel";

// Use in routing (with proper authentication)
<Route path="/admin" element={<AdminPanel />} />;
```

The AdminPanel is a protected route that should only be accessible to users with administrative privileges. It provides comprehensive system administration capabilities in a user-friendly interface.
