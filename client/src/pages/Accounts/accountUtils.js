// Mock account data for demo
export const mockAccounts = [
    {
        id: 1,
        name: "Main Checking Account",
        type: "checking",
        balance: 2500.75,
        number: "****1234",
        status: "active",
        openDate: "2023-01-15",
    },
    {
        id: 2,
        name: "High Yield Savings",
        type: "savings",
        balance: 15000.0,
        number: "****5678",
        status: "active",
        openDate: "2023-02-20",
        interestRate: 4.5,
    },
    {
        id: 3,
        name: "Premium Credit Card",
        type: "credit",
        balance: -1200.5,
        number: "****9012",
        status: "active",
        limit: 5000,
        apr: 18.99,
    },
    {
        id: 4,
        name: "Business Checking",
        type: "checking",
        balance: 8750.25,
        number: "****3456",
        status: "active",
        openDate: "2023-03-10",
    },
    {
        id: 5,
        name: "Emergency Savings",
        type: "savings",
        balance: 5000.0,
        number: "****7890",
        status: "active",
        openDate: "2023-04-01",
        interestRate: 3.8,
    },
];

// Account type configurations
export const accountTypeConfig = {
    checking: {
        badgeClass: "badge bg-primary",
        icon: "💳",
        description: "For everyday transactions and expenses",
        color: "primary",
    },
    savings: {
        badgeClass: "badge bg-success",
        icon: "💰",
        description: "For saving money and earning interest",
        color: "success",
    },
    credit: {
        badgeClass: "badge bg-warning",
        icon: "💸",
        description: "For credit purchases and building credit",
        color: "warning",
    },
};

// Calculate total balance across all accounts
export const calculateTotalBalance = (accounts) => {
    return accounts.reduce((total, account) => {
        // For credit accounts, negative balance means debt, so we subtract it
        // For other accounts, we add the balance
        if (account.type === "credit") {
            return total - Math.abs(account.balance);
        }
        return total + account.balance;
    }, 0);
};

// Calculate total assets (excluding credit debt)
export const calculateTotalAssets = (accounts) => {
    return accounts
        .filter((account) => account.type !== "credit")
        .reduce((total, account) => total + account.balance, 0);
};

// Calculate total debt (credit accounts only)
export const calculateTotalDebt = (accounts) => {
    return accounts
        .filter((account) => account.type === "credit" && account.balance < 0)
        .reduce((total, account) => total + Math.abs(account.balance), 0);
};

// Get accounts by type
export const getAccountsByType = (accounts, type) => {
    return accounts.filter((account) => account.type === type);
};

// Format account number for display
export const formatAccountNumber = (accountNumber) => {
    // Already formatted in mock data, but this could handle raw account numbers
    if (accountNumber.startsWith("****")) {
        return accountNumber;
    }
    // For full account numbers, mask all but last 4 digits
    return `****${accountNumber.slice(-4)}`;
};

// Sort accounts by balance (highest first)
export const sortAccountsByBalance = (accounts) => {
    return [...accounts].sort((a, b) => b.balance - a.balance);
};

// Sort accounts by type and then by balance
export const sortAccountsByTypeAndBalance = (accounts) => {
    const typeOrder = { checking: 1, savings: 2, credit: 3 };
    return [...accounts].sort((a, b) => {
        const typeComparison = typeOrder[a.type] - typeOrder[b.type];
        if (typeComparison !== 0) return typeComparison;
        return b.balance - a.balance;
    });
};
