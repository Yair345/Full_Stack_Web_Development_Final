// Mock data and utility functions for Dashboard components

export const mockDashboardData = {
    accounts: [
        {
            id: 1,
            name: "Checking Account",
            type: "checking",
            balance: 2500.75,
            number: "****1234",
        },
        {
            id: 2,
            name: "Savings Account",
            type: "savings",
            balance: 15000.0,
            number: "****5678",
        },
        {
            id: 3,
            name: "Credit Card",
            type: "credit",
            balance: -1200.5,
            number: "****9012",
            limit: 5000,
        },
    ],
    recentTransactions: [
        {
            id: 1,
            description: "Grocery Store",
            amount: -85.32,
            date: "2025-08-12",
            type: "debit",
        },
        {
            id: 2,
            description: "Salary Deposit",
            amount: 3200.0,
            date: "2025-08-10",
            type: "credit",
        },
        {
            id: 3,
            description: "Electric Bill",
            amount: -120.45,
            date: "2025-08-09",
            type: "debit",
        },
        {
            id: 4,
            description: "ATM Withdrawal",
            amount: -100.0,
            date: "2025-08-08",
            type: "debit",
        },
    ],
    monthlyIncome: 3200,
    monthlyExpenses: 1450,
    savingsGoal: 20000,
    currentSavings: 15000
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

export const getAccountIcon = (type) => {
    const icons = {
        checking: "CreditCard",
        savings: "TrendingUp",
        credit: "DollarSign",
        investment: "BarChart3",
        default: "CreditCard"
    };
    return icons[type] || icons.default;
};

export const getAccountTypeColor = (type) => {
    const colors = {
        checking: "primary",
        savings: "success",
        credit: "warning",
        investment: "info",
        default: "secondary"
    };
    return colors[type] || colors.default;
};

export const calculateTotalBalance = (accounts) => {
    // Ensure accounts is an array
    if (!Array.isArray(accounts)) {
        return 0;
    }

    return accounts.reduce((sum, account) => {
        // Handle both mock data format and real API format
        const balance = parseFloat(account.balance || 0);

        // For credit accounts, we want to show available credit, not negative balance
        if (account.type === "credit" || account.account_type === "credit") {
            const limit = parseFloat(account.limit || account.overdraft_limit || 0);
            return sum + limit + balance; // balance is negative for debt
        }
        return sum + balance;
    }, 0);
};

export const calculateNetWorth = (accounts) => {
    // Ensure accounts is an array
    if (!Array.isArray(accounts)) {
        return 0;
    }

    return accounts.reduce((sum, account) => {
        const balance = parseFloat(account.balance || 0);
        return sum + balance;
    }, 0);
};

export const getTransactionIcon = (type) => {
    return type === "credit" ? "ArrowUpRight" : "ArrowDownRight";
};

export const getTransactionColor = (type) => {
    return type === "credit" ? "success" : "danger";
};

export const calculateMonthlySpending = (transactions) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Ensure transactions is an array
    if (!Array.isArray(transactions)) {
        return 0;
    }

    const spendingTransactions = transactions.filter(transaction => {
        // Handle different date field names from API - both transformed and raw formats
        const dateField = transaction.date ||
            transaction.created_at ||
            transaction.processed_at ||
            transaction.createdAt;

        if (!dateField) {
            return false;
        }

        const transactionDate = new Date(dateField);
        const isCurrentMonth = transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear;

        // Enhanced expense detection for both raw and transformed data
        let isExpense = false;

        // Handle transformed transaction format first (has 'type' field)
        if (transaction.type) {
            if (transaction.amount < 0 || transaction.type === 'debit') {
                isExpense = true;
            }
        }
        // Handle raw transaction format (has 'transaction_type' field)
        else if (transaction.transaction_type) {
            if (['withdrawal', 'payment'].includes(transaction.transaction_type)) {
                isExpense = true;
            }
            // For raw transfer transactions, check if it's outgoing (from user's account)
            else if (transaction.transaction_type === 'transfer' &&
                transaction.from_account_id && !transaction.to_account_id) {
                isExpense = true;
            }
        }
        // Fallback: if amount is negative, it's likely an expense
        else if (transaction.amount < 0) {
            isExpense = true;
        }

        return isCurrentMonth && isExpense;
    });

    // Calculate total using absolute values
    const totalSpending = spendingTransactions.reduce((sum, transaction) => {
        const absAmount = Math.abs(transaction.amount);
        return sum + absAmount;
    }, 0);

    return totalSpending;
};

export const calculateMonthlyIncome = (transactions) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Ensure transactions is an array
    if (!Array.isArray(transactions)) {
        return 0;
    }

    const incomeTransactions = transactions.filter(transaction => {
        // Handle different date field names from API - both transformed and raw formats
        const dateField = transaction.date ||
            transaction.created_at ||
            transaction.processed_at ||
            transaction.createdAt;

        if (!dateField) return false;

        const transactionDate = new Date(dateField);
        const isCurrentMonth = transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear;

        // Enhanced income detection for both raw and transformed data
        let isIncome = false;

        // Handle transformed transaction format first (has 'type' field)
        if (transaction.type) {
            if (transaction.amount > 0 || transaction.type === 'credit') {
                isIncome = true;
            }
        }
        // Handle raw transaction format (has 'transaction_type' field)
        else if (transaction.transaction_type) {
            if (transaction.transaction_type === 'deposit') {
                isIncome = true;
            }
            // For raw transfer transactions, check if it's incoming (to user's account only)
            else if (transaction.transaction_type === 'transfer' &&
                transaction.to_account_id && !transaction.from_account_id) {
                isIncome = true;
            }
        }
        // Fallback: if amount is positive, it's likely income
        else if (transaction.amount > 0) {
            isIncome = true;
        }

        return isCurrentMonth && isIncome;
    });

    // Calculate total using absolute values
    const totalIncome = incomeTransactions.reduce((sum, transaction) => {
        const absAmount = Math.abs(transaction.amount);
        return sum + absAmount;
    }, 0);

    return totalIncome;
};

export const getSavingsProgress = (currentSavings, savingsGoal) => {
    return Math.round((currentSavings / savingsGoal) * 100);
};

export const getFinancialHealthScore = (accounts, transactions) => {
    // Ensure inputs are arrays
    if (!Array.isArray(accounts)) accounts = [];
    if (!Array.isArray(transactions)) transactions = [];

    const totalBalance = calculateNetWorth(accounts);
    const monthlyIncome = calculateMonthlyIncome(transactions);
    const monthlySpending = calculateMonthlySpending(transactions);

    // Simple calculation based on balance, income vs spending ratio
    let score = 50; // Base score

    // Positive balance adds to score
    if (totalBalance > 0) {
        score += Math.min(30, totalBalance / 1000);
    }

    // Good income vs spending ratio adds to score
    if (monthlyIncome > monthlySpending) {
        const ratio = monthlyIncome / (monthlySpending || 1);
        score += Math.min(20, ratio * 5);
    }

    return Math.round(Math.min(100, Math.max(0, score)));
};
