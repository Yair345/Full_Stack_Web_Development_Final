# Accounts Page Components

This directory contains all the components and utilities for the Accounts page, broken down into smaller, manageable pieces.

## Structure

```
Accounts/
├── index.jsx              # Main Accounts component (container)
├── AccountsHeader.jsx     # Page header with title and "Open New Account" button
├── AccountsList.jsx       # Accounts grid with loading/error states
├── AccountCard.jsx        # Individual account card component
├── accountUtils.js        # Utility functions and mock data
└── README.md             # This documentation
```

## Components

### `index.jsx` (Main Container)

-   Manages accounts state and loading states
-   Simulates API calls with mock data
-   Handles account creation flow
-   ~40 lines vs original 170+ lines

### `AccountsHeader.jsx`

-   Page title and description
-   "Open New Account" button with callback
-   ~25 lines

### `AccountsList.jsx`

-   Renders grid of account cards
-   Handles loading, error, and empty states
-   Maps through accounts and renders AccountCard components
-   ~50 lines

### `AccountCard.jsx`

-   Individual account card rendering
-   Account type-specific information (interest rates, credit limits, etc.)
-   Action buttons (View Details, Statements)
-   Dropdown menu with additional options
-   Badge styling based on account type
-   ~100 lines

### `accountUtils.js`

-   Enhanced mock data with more accounts
-   Account type configurations and styling
-   Utility functions for calculations (total balance, assets, debt)
-   Sorting and filtering functions
-   Account number formatting
-   ~130 lines

## Key Features

### Account Types Supported

-   **Checking**: Everyday transactions
-   **Savings**: Interest-earning accounts
-   **Credit**: Credit cards with limits and APR

### Account Information Display

-   Account name and masked number
-   Current balance (with appropriate color coding)
-   Account type badge
-   Opening date
-   Type-specific details:
    -   Savings: Interest rate (APY)
    -   Credit: Credit limit and APR

### Interactive Elements

-   Dropdown menu with account actions
-   View Details and Statements buttons
-   Hover effects on cards
-   Loading and error states

### Utility Functions

-   Calculate total balance across accounts
-   Calculate total assets (excluding debt)
-   Calculate total debt from credit accounts
-   Sort accounts by type and balance
-   Account type configurations

## Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: AccountCard can be used in other parts of the app
3. **Testing**: Easier to write unit tests for individual components
4. **Scalability**: Easy to add new account types or features
5. **Performance**: Smaller components allow for better optimization
6. **Readability**: Much easier to understand and navigate

## Future Enhancements

-   Account filtering and sorting options
-   Account summary statistics
-   Quick actions (transfer, pay bills, etc.)
-   Account activity preview
-   New account creation modal
-   Account settings and management

## Usage

The main entry point is still `pages/Accounts.jsx` which simply exports the default from `./Accounts/index.jsx`, maintaining backward compatibility with existing imports.
