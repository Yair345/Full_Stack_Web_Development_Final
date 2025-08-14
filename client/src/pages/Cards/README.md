# Cards Page Components

This directory contains all components related to the Cards page functionality.

## Components Structure

-   **Cards.jsx** - Main component that orchestrates the cards page
-   **CardsHeader.jsx** - Header section with page title and action buttons
-   **CardsList.jsx** - Container component for displaying the list of cards
-   **CardItem.jsx** - Individual card component with visual representation
-   **CardsSummary.jsx** - Summary component showing credit utilization and totals
-   **PaymentCalculator.jsx** - Interactive calculator for payment planning
-   **cardUtils.js** - Utility functions and mock data for cards

## Features

-   Visual card representations with gradient backgrounds
-   Toggle card number visibility
-   Block/unblock card functionality
-   Credit utilization tracking
-   Payment calculator for credit cards
-   Responsive design with Bootstrap classes

## Data Flow

The main Cards component manages state and passes data down to child components. Mock data is provided through cardUtils.js and includes card details, transactions, and utility functions for calculations.
