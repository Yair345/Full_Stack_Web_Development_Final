# Transactions Page Components

This directory contains all the components and utilities for the Transactions page, fully integrated with the server API through custom hooks.

## Structure

```
Transactions/
├── Transactions.jsx              # Main Transactions component (container)
├── TransactionSummaryCards.jsx  # Summary statistics cards (Income, Expenses, Count)
├── TransactionFilters.jsx       # Search and filter functionality
├── TransactionList.jsx          # Transaction table with loading/error states
├── TransactionItem.jsx          # Individual transaction row component
├── transactionUtils.js          # Utility functions and data transformation
└── README.md                    # This documentation
```

## API Integration

The transactions page is now fully connected to the server using custom React hooks:

### Hooks Used

1. **`useTransactions(filters)`**

    - Fetches transactions from `/api/transactions`
    - Supports filtering by date, type, amount range
    - Includes pagination support
    - Auto-transforms server data to client format
    - Returns: `{ transactions, pagination, loading, error, refetch }`

2. **`useTransactionSummary(filters)`**
    - Fetches summary data from `/api/transactions/summary`
    - Provides totals for income, expenses, transaction count
    - Returns: `{ summary, loading, error, refetch }`

### Data Transformation

Server transaction data is transformed for client display:

-   Server fields → Client fields
-   `transaction_type` → `type` (credit/debit/transfer)
-   `created_at` → `date`
-   Amount signs adjusted based on transaction direction
-   Account information formatted for display
-   Categories mapped from transaction types

## Components

### `Transactions.jsx` (Main Container)

-   Uses `useTransactions` and `useTransactionSummary` hooks
-   Manages local state for filters and pagination
-   Handles data refresh functionality
-   Coordinates all child components
-   ~150 lines with full API integration

### `TransactionSummaryCards.jsx`

-   Uses API summary data when available
-   Falls back to client-side calculation if needed
-   Shows loading states for better UX
-   ~80 lines with API integration

### `TransactionFilters.jsx`

-   Search functionality (client-side)
-   Date range filters (API-level)
-   Transaction type filters (API-level)
-   Amount range filters (API-level)
-   Filter clear functionality
-   ~100 lines

### `TransactionList.jsx`

-   Renders paginated transaction table
-   Handles loading, error, and empty states
-   Includes refresh functionality
-   Uses TransactionItem for individual rows
-   ~80 lines

### `TransactionItem.jsx`

-   Renders individual transaction rows
-   Works with transformed server data
-   Transaction icons and status badges
-   Proper formatting for all data types
-   ~80 lines

### `transactionUtils.js`

-   Data transformation functions (`transformServerTransaction`, `transformServerTransactions`)
-   Client-side filtering for search functionality
-   CSV export functionality
-   Mock data (kept for development/testing)
-   ~200 lines with transformation logic

## Server API Endpoints

The following server endpoints are consumed:

1. **GET `/api/transactions`**

    - Query params: `page`, `limit`, `type`, `status`, `start_date`, `end_date`, `account_id`
    - Returns: Paginated transaction list with account details

2. **GET `/api/transactions/summary`**

    - Query params: `period` (days)
    - Returns: Transaction summary statistics

3. **GET `/api/accounts`**
    - Used internally by hooks for data transformation
    - Provides user account IDs for transaction processing

## Features

### Real-time Features

-   ✅ Live data from server API
-   ✅ Automatic data refresh
-   ✅ Manual refresh button
-   ✅ Loading states throughout

### Filtering & Search

-   ✅ Server-side filtering (date, type, amount)
-   ✅ Client-side search (description, merchant)
-   ✅ Filter persistence during pagination
-   ✅ Clear all filters functionality

### Pagination

-   ✅ Server-side pagination (20 items per page)
-   ✅ Navigation controls (Previous/Next)
-   ✅ Page number buttons
-   ✅ Results summary display

### Data Export

-   ✅ CSV export of filtered transactions
-   ✅ Proper CSV escaping for special characters

### Error Handling

-   ✅ Network error handling
-   ✅ Loading states
-   ✅ Retry functionality
-   ✅ Fallback to client-side calculations

## Benefits of This Architecture

1. **API-First**: Direct server integration with proper error handling
2. **Performance**: Server-side filtering and pagination
3. **Maintainability**: Clean separation of concerns
4. **Reusability**: Custom hooks can be used elsewhere
5. **Testing**: Easy to mock hooks for testing
6. **Type Safety**: Consistent data transformation
7. **User Experience**: Loading states, error handling, real-time data

## Usage

The transactions page automatically loads and displays real transaction data from the server. All filtering, pagination, and summary calculations happen in real-time with proper loading states and error handling.

```jsx
import {
	useTransactions,
	useTransactionSummary,
} from "../../hooks/api/apiHooks";

// In your component
const { transactions, loading, error, refetch } = useTransactions(filters);
const { summary } = useTransactionSummary(filters);
```
