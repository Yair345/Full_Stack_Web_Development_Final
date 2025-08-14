# Loans Page Components

This directory contains all components related to the Loans page functionality.

## Components Structure

-   **Loans.jsx** - Main component that orchestrates the loans page
-   **LoansHeader.jsx** - Header section with page title and description
-   **LoansTabs.jsx** - Navigation tabs for different loan sections
-   **LoansSummary.jsx** - Summary cards showing total balance, payments, and statistics
-   **LoansList.jsx** - Container component for displaying active loans
-   **LoanItem.jsx** - Individual loan component with progress and payment info
-   **LoanCalculator.jsx** - Interactive loan payment calculator
-   **LoanApplicationsTab.jsx** - Tab showing available loan products for application
-   **ApplicationsStatusTab.jsx** - Tab showing status of submitted applications
-   **loanUtils.js** - Utility functions and mock data for loans

## Features

-   Loan overview with progress tracking
-   Monthly payment management
-   Interactive loan calculator
-   Loan application process
-   Application status tracking
-   Multiple loan types (personal, auto, mortgage, student)
-   Progress indicators and payment history

## Data Flow

The main Loans component manages state and coordinates between all child components. Mock data includes active loans, applications, and loan product information with comprehensive calculation utilities.
