// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

// Format date
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Format phone number
export const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    return phoneNumber;
};

// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Generate account number (for display purposes)
export const generateAccountNumber = () => {
    return Math.random().toString().slice(2, 12);
};

// Mask sensitive data
export const maskAccountNumber = (accountNumber) => {
    return `****${accountNumber.slice(-4)}`;
};

export const maskCardNumber = (cardNumber) => {
    return `****-****-****-${cardNumber.slice(-4)}`;
};

// Calculate loan payment
export const calculateLoanPayment = (principal, rate, term) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;

    if (monthlyRate === 0) {
        return principal / numPayments;
    }

    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
};

// Debounce function
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// Class names utility
export const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

export default {
    formatCurrency,
    formatDate,
    formatPhoneNumber,
    isValidEmail,
    generateAccountNumber,
    maskAccountNumber,
    maskCardNumber,
    calculateLoanPayment,
    debounce,
    classNames,
};
