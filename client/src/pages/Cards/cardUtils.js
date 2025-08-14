// Mock data for cards
export const mockCards = [
    {
        id: 1,
        cardNumber: "**** **** **** 1234",
        fullNumber: "4532 1234 5678 1234",
        holderName: "John Doe",
        expiryDate: "12/26",
        cardType: "Visa",
        accountType: "Credit",
        balance: 2500.75,
        creditLimit: 5000.00,
        availableCredit: 2499.25,
        status: "active",
        color: "bg-gradient-primary"
    },
    {
        id: 2,
        cardNumber: "**** **** **** 5678",
        fullNumber: "5432 9876 5432 5678",
        holderName: "John Doe",
        expiryDate: "08/27",
        cardType: "Mastercard",
        accountType: "Debit",
        balance: 12450.30,
        availableBalance: 12450.30,
        status: "active",
        color: "bg-gradient-success"
    },
    {
        id: 3,
        cardNumber: "**** **** **** 9012",
        fullNumber: "3782 8224 6310 9012",
        holderName: "John Doe",
        expiryDate: "03/28",
        cardType: "American Express",
        accountType: "Credit",
        balance: 856.40,
        creditLimit: 10000.00,
        availableCredit: 9143.60,
        status: "blocked",
        color: "bg-gradient-warning"
    }
];

// Mock transaction data for cards
export const mockCardTransactions = [
    {
        id: 1,
        cardId: 1,
        merchant: "Amazon",
        amount: 89.99,
        date: "2025-08-14",
        category: "Shopping",
        status: "completed"
    },
    {
        id: 2,
        cardId: 1,
        merchant: "Starbucks",
        amount: 4.75,
        date: "2025-08-13",
        category: "Food & Dining",
        status: "completed"
    },
    {
        id: 3,
        cardId: 2,
        merchant: "Gas Station",
        amount: 45.20,
        date: "2025-08-12",
        category: "Gas",
        status: "completed"
    },
    {
        id: 4,
        cardId: 3,
        merchant: "Restaurant",
        amount: 65.30,
        date: "2025-08-11",
        category: "Food & Dining",
        status: "pending"
    }
];

// Utility functions for cards
export const formatCardNumber = (number) => {
    return number.replace(/(.{4})/g, '$1 ').trim();
};

export const getCardIcon = (cardType) => {
    const icons = {
        'Visa': '💳',
        'Mastercard': '💳',
        'American Express': '💳'
    };
    return icons[cardType] || '💳';
};

export const getCardStatusColor = (status) => {
    const colors = {
        'active': 'success',
        'blocked': 'danger',
        'expired': 'secondary'
    };
    return colors[status] || 'secondary';
};

export const calculateMonthlyPayment = (balance, interestRate, term) => {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = term;

    if (monthlyRate === 0) {
        return balance / numberOfPayments;
    }

    return (balance * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};
