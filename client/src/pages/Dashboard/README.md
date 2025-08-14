# Dashboard Page

The Dashboard provides a comprehensive overview of the user's financial status with quick stats, account summaries, recent transactions, and financial insights.

## Components

### Dashboard.jsx (Main Component)

-   Main orchestrator component that manages dashboard state and layout
-   Integrates all dashboard components into a cohesive interface
-   Handles navigation actions to other parts of the application

### DashboardHeader.jsx

-   Welcome section with personalized greeting using Redux user state
-   Sets the tone for the dashboard with gradient background
-   Displays contextual information about the dashboard purpose

### QuickStatsCards.jsx

-   Displays three key financial metrics in card format
-   Shows total balance, active accounts count, and financial health score
-   Uses dynamic colors based on financial status (positive/negative values)
-   Includes contextual subtitles for better understanding

### AccountsOverview.jsx

-   Lists all user accounts with visual cards
-   Shows account types, balances, and account numbers
-   Handles different account types (checking, savings, credit, investment)
-   Provides specialized display for credit accounts showing available credit
-   Includes empty state when no accounts are available

### RecentTransactions.jsx

-   Displays recent transaction history in a clean list format
-   Shows transaction descriptions, dates, and amounts
-   Uses color coding for income (green) vs expenses (red)
-   Includes transaction type icons for visual identification
-   Handles empty state with helpful messaging

### FinancialInsights.jsx

-   Provides advanced financial analytics and insights
-   Shows monthly income, spending, net cash flow, and savings progress
-   Includes visual progress bar for savings goals
-   Displays trends and comparisons with previous periods
-   Uses dynamic coloring based on financial health indicators

## Utilities

### dashboardUtils.js

-   Contains mock data for development and testing
-   Provides utility functions for financial calculations
-   Includes formatting helpers for currency and dates
-   Contains functions for determining account icons and colors
-   Provides financial health scoring algorithm

## Features

-   **Real-time Financial Overview**: Quick access to all important financial metrics
-   **Account Management**: Visual representation of all connected accounts
-   **Transaction Monitoring**: Recent activity tracking with visual indicators
-   **Financial Health**: Automated scoring and insights based on financial behavior
-   **Responsive Design**: Optimized for all screen sizes and devices
-   **Interactive Elements**: Click handlers for navigation to detailed pages

## Data Flow

The Dashboard component manages all data through local state initialized with mock data. In a production environment, this would connect to:

-   Account APIs for real-time balance information
-   Transaction APIs for recent activity
-   User preferences for customized insights
-   Financial analytics services for health scoring

## State Management

The Dashboard uses:

-   Local state for dashboard-specific data
-   Redux state for user authentication information
-   Component props for data flow between parent and child components

## Integration

The Dashboard integrates with:

-   Layout component for consistent page structure
-   UI components (Card, Button) for consistent styling
-   Lucide React icons for visual elements
-   Bootstrap classes for responsive grid system
-   Redux store for user authentication state

## Usage

```jsx
import Dashboard from "./pages/Dashboard/Dashboard";

// Use in routing
<Route path="/dashboard" element={<Dashboard />} />;
```

The Dashboard is the main landing page after user login and provides quick access to all banking features through its various components and navigation elements.
