// Mock data for existing loans
export const mockLoans = [
    {
        id: 1,
        type: "mortgage",
        name: "Home Mortgage",
        originalAmount: 350000,
        currentBalance: 298750.50,
        monthlyPayment: 1680.45,
        interestRate: 3.25,
        termMonths: 360,
        remainingMonths: 312,
        nextPaymentDate: "2025-09-01",
        status: "current"
    },
    {
        id: 2,
        type: "auto",
        name: "Auto Loan",
        originalAmount: 35000,
        currentBalance: 18250.75,
        monthlyPayment: 485.20,
        interestRate: 4.5,
        termMonths: 72,
        remainingMonths: 38,
        nextPaymentDate: "2025-08-25",
        status: "current"
    },
    {
        id: 3,
        type: "personal",
        name: "Personal Loan",
        originalAmount: 15000,
        currentBalance: 8750.00,
        monthlyPayment: 425.30,
        interestRate: 8.75,
        termMonths: 48,
        remainingMonths: 22,
        nextPaymentDate: "2025-08-20",
        status: "current"
    }
];

// Mock data for loan applications
export const mockApplications = [
    {
        id: 1,
        type: "personal",
        amount: 25000,
        purpose: "Home Improvement",
        status: "under_review",
        submittedDate: "2025-08-10",
        expectedDecision: "2025-08-17"
    },
    {
        id: 2,
        type: "auto",
        amount: 45000,
        purpose: "Vehicle Purchase",
        status: "approved",
        submittedDate: "2025-08-05",
        approvedDate: "2025-08-12",
        rate: 4.25
    }
];

// Loan types with details
export const loanTypes = [
    {
        type: "personal",
        name: "Personal Loan",
        icon: "DollarSign",
        description: "For personal expenses, debt consolidation, or major purchases",
        rates: "7.00% - 12.50% APR",
        terms: "6 - 60 months",
        maxAmount: "$100,000"
    },
    {
        type: "mortgage",
        name: "Home Mortgage",
        icon: "Home",
        description: "Purchase or refinance your home with competitive rates",
        rates: "3.50% - 4.50% APR",
        terms: "10 - 30 years",
        maxAmount: "$2,000,000"
    },
    {
        type: "auto",
        name: "Auto Loan",
        icon: "Car",
        description: "Finance your new or used vehicle purchase",
        rates: "3.50% - 5.50% APR",
        terms: "12 - 72 months",
        maxAmount: "$150,000"
    },
    {
        type: "business",
        name: "Business Loan",
        icon: "DollarSign",
        description: "Grow your business with flexible financing solutions",
        rates: "5.80% - 8.50% APR",
        terms: "12 - 60 months",
        maxAmount: "$500,000"
    }
];

// Utility functions
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
};

export const getLoanIcon = (type) => {
    const iconMap = {
        mortgage: "Home",
        auto: "Car",
        personal: "DollarSign",
        student: "GraduationCap"
    };
    return iconMap[type] || "DollarSign";
};

export const getStatusBadge = (status) => {
    const statusMap = {
        // Current system statuses
        current: { class: "bg-success", text: "Current" },
        late: { class: "bg-warning", text: "Late" },
        overdue: { class: "bg-danger", text: "Overdue" },
        
        // Database statuses (from LOAN_STATUS constants)
        pending: { class: "bg-warning", text: "Pending" },
        approved: { class: "bg-info", text: "Approved" },
        rejected: { class: "bg-danger", text: "Rejected" },
        active: { class: "bg-success", text: "Active" },
        paid_off: { class: "bg-success", text: "Paid Off" },
        defaulted: { class: "bg-danger", text: "Defaulted" },
        
        // Legacy statuses for compatibility
        under_review: { class: "bg-warning", text: "Under Review" },
        denied: { class: "bg-danger", text: "Denied" }
    };
    return statusMap[status] || { class: "bg-secondary", text: "Unknown" };
};

export const calculateLoanPayment = (amount, term, rate) => {
    if (!amount || !term || !rate) return 0;

    const principal = parseFloat(amount);
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const numPayments = parseInt(term);

    if (monthlyRate === 0) return principal / numPayments;

    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

    return payment;
};

export const calculateProgress = (original, current) => {
    return ((original - current) / original) * 100;
};
