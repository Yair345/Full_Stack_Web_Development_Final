# API Hooks Structure

This directory contains a well-organized collection of React hooks for handling API requests in the SecureBank application.

## Directory Structure

```
hooks/
├── api/
│   ├── core/
│   │   └── useApiCore.js          # Core API functionality (useApi, useMutation, useInfiniteApi)
│   ├── features/
│   │   ├── useAccountHooks.js     # Account-related hooks
│   │   ├── useTransactionHooks.js # Transaction-related hooks
│   │   ├── useAuthHooks.js        # Authentication hooks
│   │   └── useDashboardHooks.js   # Dashboard and utility hooks
│   └── apiHooks.js                # Main export file for all API hooks
├── useAuth.js                     # Legacy authentication hook
└── index.js                       # Main hooks export
```

## Core Hooks (`core/useApiCore.js`)

### `useApi(endpoint, options)`

Generic hook for API requests with caching, loading states, and error handling.

### `useMutation(mutationFn)`

Hook for handling mutations (POST, PUT, DELETE operations).

### `useInfiniteApi(fetchFunction, options)`

Hook for infinite scrolling/pagination.

## Feature-Specific Hooks

### Account Hooks (`features/useAccountHooks.js`)

-   `useAccounts()` - Fetch all user accounts
-   `useAccount(accountId)` - Fetch specific account
-   `useCreateAccount()` - Create new account
-   `useUpdateAccount()` - Update existing account

### Transaction Hooks (`features/useTransactionHooks.js`)

-   `useTransactions(filters)` - Fetch transactions with filtering
-   `useInfiniteTransactions(filters)` - Infinite scroll transactions
-   `useTransaction(transactionId)` - Fetch specific transaction
-   `useCreateTransaction()` - Create new transaction

### Authentication Hooks (`features/useAuthHooks.js`)

-   `useAuthMutations()` - Authentication operations (login, register, logout, refresh)

### Dashboard Hooks (`features/useDashboardHooks.js`)

-   `useDashboard()` - Combined accounts and recent transactions
-   `usePolling(fetchFunction, interval, enabled)` - Real-time data updates

## Usage

Import hooks from the main export:

```javascript
import {
	useAccounts,
	useTransactions,
	useCreateTransaction,
	useDashboard,
} from "../hooks";
```

Or import specific feature hooks:

```javascript
import { useAccounts, useAccount } from "../hooks/api/features/useAccountHooks";
```

## Benefits of This Structure

1. **Separation of Concerns**: Core functionality separated from feature-specific hooks
2. **Maintainability**: Easy to find and modify specific functionality
3. **Scalability**: Simple to add new feature-specific hooks
4. **Reusability**: Core hooks can be used across different features
5. **Clear Dependencies**: Import paths clearly show what functionality is being used

## Migration from Old Structure

The old files (`useApi.js`, `useApiHooks.js`) can be safely removed after verifying all imports are updated to use the new structure. The public API remains the same - only the internal organization has changed.
