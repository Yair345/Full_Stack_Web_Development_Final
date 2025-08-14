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
    return accounts.reduce((sum, account) => {
        // For credit accounts, we want to show available credit, not negative balance
        if (account.type === "credit") {
            return sum + (account.limit || 0) + account.balance;
        }
        return sum + account.balance;
    }, 0);
};

export const calculateNetWorth = (accounts) => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
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

    return transactions
        .filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear &&
                transaction.amount < 0;
        })
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
};

export const calculateMonthlyIncome = (transactions) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions
        .filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear &&
                transaction.amount > 0;
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0);
};

export const getSavingsProgress = (currentSavings, savingsGoal) => {
    return Math.round((currentSavings / savingsGoal) * 100);
};

export const getFinancialHealthScore = (accounts, transactions) => {
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
