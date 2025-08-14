# Transfer Page Components

This directory contains all components related to the Transfer page functionality.

## Components Structure

-   **Transfer.jsx** - Main component that orchestrates the transfer page
-   **TransferHeader.jsx** - Header section with page title and icon
-   **TransferTabs.jsx** - Navigation tabs for different transfer sections
-   **QuickTransferForm.jsx** - Form component for quick transfers
-   **TransferLimits.jsx** - Sidebar component showing transfer limits and security info
-   **RecipientsTab.jsx** - Tab component for managing recent recipients
-   **ScheduledTransfersTab.jsx** - Tab component for scheduled transfers
-   **TransferHistoryTab.jsx** - Tab component for transfer history
-   **transferUtils.js** - Utility functions and mock data for transfers

## Features

-   Quick transfer between accounts
-   External transfer functionality
-   Wire transfer options
-   Recent recipients management
-   Scheduled transfers
-   Transfer limits and security notices
-   Transfer history

## Data Flow

The main Transfer component manages state and coordinates between all child components. Mock data includes accounts, recipients, and scheduled transfers with proper validation and utility functions.
