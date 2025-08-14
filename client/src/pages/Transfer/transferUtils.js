// Mock data for transfers
export const mockAccounts = [
    {
        id: 1,
        name: "Checking Account",
        number: "****1234",
        balance: 2500.75,
        type: "checking"
    },
    {
        id: 2,
        name: "Savings Account",
        number: "****5678",
        balance: 15000.00,
        type: "savings"
    },
    {
        id: 3,
        name: "Business Account",
        number: "****9012",
        balance: 8750.25,
        type: "business"
    }
];

export const mockRecentRecipients = [
    {
        id: 1,
        name: "Sarah Johnson",
        accountNumber: "****4567",
        bank: "Same Bank",
        lastTransfer: "2025-08-12",
        type: "internal"
    },
    {
        id: 2,
        name: "Mike Wilson",
        accountNumber: "****8901",
        bank: "First National Bank",
        lastTransfer: "2025-08-10",
        type: "external"
    },
    {
        id: 3,
        name: "Electric Company",
        accountNumber: "****2345",
        bank: "Business Bank",
        lastTransfer: "2025-08-08",
        type: "bill"
    }
];

export const mockScheduledTransfers = [
    {
        id: 1,
        recipient: "Savings Account",
        amount: 500.00,
        frequency: "Monthly",
        nextDate: "2025-09-01",
        status: "active"
    },
    {
        id: 2,
        recipient: "Electric Company",
        amount: 120.00,
        frequency: "Monthly",
        nextDate: "2025-08-20",
        status: "active"
    },
    {
        id: 3,
        recipient: "Sarah Johnson",
        amount: 200.00,
        frequency: "Weekly",
        nextDate: "2025-08-18",
        status: "paused"
    }
];

// Utility functions
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
};

export const getAccountIcon = (type) => {
    const icons = {
        checking: "CreditCard",
        savings: "Building",
        business: "Building"
    };
    return icons[type] || "CreditCard";
};

export const validateTransferAmount = (amount, fromAccountBalance, dailyLimit = 2500) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
        return { isValid: false, error: "Please enter a valid amount" };
    }

    if (numAmount > fromAccountBalance) {
        return { isValid: false, error: "Insufficient funds" };
    }

    if (numAmount > dailyLimit) {
        return { isValid: false, error: `Amount exceeds daily limit of ${formatCurrency(dailyLimit)}` };
    }

    return { isValid: true, error: null };
};
