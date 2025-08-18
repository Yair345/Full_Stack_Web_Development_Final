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

export const validateTransferAmount = (amount, fromAccountBalance, dailyLimit = 2500, monthlyLimit = 25000, dailyUsed = 750, monthlyUsed = 5200) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
        return { isValid: false, error: "Please enter a valid amount" };
    }

    if (numAmount > fromAccountBalance) {
        return { isValid: false, error: "Insufficient funds" };
    }

    const dailyRemaining = dailyLimit - dailyUsed;
    const monthlyRemaining = monthlyLimit - monthlyUsed;

    if (numAmount > dailyRemaining) {
        return { isValid: false, error: `Amount exceeds daily limit. You can transfer up to ${formatCurrency(dailyRemaining)} more today.` };
    }

    if (numAmount > monthlyRemaining) {
        return { isValid: false, error: `Amount exceeds monthly limit. You can transfer up to ${formatCurrency(monthlyRemaining)} more this month.` };
    }

    return { isValid: true, error: null };
};

export const getMaxTransferAmount = (fromAccountBalance, dailyLimit = 2500, monthlyLimit = 25000, dailyUsed = 750, monthlyUsed = 5200) => {
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);

    return Math.min(fromAccountBalance, dailyRemaining, monthlyRemaining);
};

export const validateAccountNumber = (accountNumber, type = 'external') => {
    if (!accountNumber || accountNumber.trim() === '') {
        return { isValid: false, error: "Account number is required" };
    }

    const cleanAccountNumber = accountNumber.replace(/\s/g, '');

    if (type === 'external') {
        // Basic validation for external account numbers
        if (cleanAccountNumber.length < 8 || cleanAccountNumber.length > 17) {
            return { isValid: false, error: "Account number must be 8-17 digits" };
        }

        if (!/^\d+$/.test(cleanAccountNumber)) {
            // Check if it might be an email for external transfers
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(accountNumber)) {
                return { isValid: false, error: "Please enter a valid account number or email address" };
            }
        }
    } else if (type === 'wire') {
        // Wire transfer validation - more strict
        if (cleanAccountNumber.length < 10 || cleanAccountNumber.length > 17) {
            return { isValid: false, error: "Wire transfer account number must be 10-17 digits" };
        }

        if (!/^\d+$/.test(cleanAccountNumber)) {
            return { isValid: false, error: "Wire transfer account number must contain only digits" };
        }
    }

    return { isValid: true, error: null };
};

export const formatAccountDisplay = (accountNumber, hidePartial = true) => {
    if (!accountNumber) return '';

    const cleanNumber = accountNumber.toString().replace(/\s/g, '');

    if (hidePartial && cleanNumber.length > 4) {
        const lastFour = cleanNumber.slice(-4);
        const stars = '*'.repeat(Math.min(cleanNumber.length - 4, 8));
        return `${stars}${lastFour}`;
    }

    return cleanNumber;
};

export const getTransferFee = (amount, transferType, isInternational = false) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) return 0;

    switch (transferType) {
        case 'internal':
            return 0; // No fee for internal transfers
        case 'external':
            return isInternational ? 15.00 : 3.00;
        case 'wire':
            return isInternational ? 45.00 : 25.00;
        default:
            return 0;
    }
};

export const calculateTotalWithFees = (amount, transferType, isInternational = false) => {
    const numAmount = parseFloat(amount);
    const fee = getTransferFee(amount, transferType, isInternational);

    return {
        amount: numAmount,
        fee: fee,
        total: numAmount + fee
    };
};

// Transform server account data to match the expected format
export const transformServerAccountsForTransfer = (accounts) => {
    if (!Array.isArray(accounts)) return [];

    return accounts.map(account => ({
        id: account.id,
        name: account.name || `${(account.type || 'checking').charAt(0).toUpperCase() + (account.type || 'checking').slice(1)} Account`,
        number: formatAccountDisplay(account.number),
        fullNumber: account.number,
        balance: parseFloat(account.balance) || 0,
        type: account.type || 'checking',
        isActive: account.status === 'active'
    }));
};

// Additional validation functions for schedule transfer form
export const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);

    if (!amount || amount.trim() === '') {
        return { isValid: false, error: "Amount is required" };
    }

    if (isNaN(numAmount) || numAmount <= 0) {
        return { isValid: false, error: "Please enter a valid amount" };
    }

    if (numAmount < 0.01) {
        return { isValid: false, error: "Minimum amount is $0.01" };
    }

    if (numAmount > 999999.99) {
        return { isValid: false, error: "Maximum amount is $999,999.99" };
    }

    return { isValid: true, error: null };
};

export const formatAccountOption = (account) => {
    if (!account) {
        return 'Unknown Account';
    }

    const name = account.name || 'Unnamed Account';
    const number = account.number || 'No Number';
    const balance = (account.balance !== undefined && account.balance !== null) ? account.balance : 0;

    return `${name} - ${number} (${formatCurrency(balance)})`;
};