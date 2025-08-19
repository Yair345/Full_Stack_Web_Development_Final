// Mock data and utility functions for BranchManagement components

export const mockBranchData = {
    branchStats: {
        totalCustomers: 1247,
        newCustomersThisMonth: 23,
        totalAccounts: 2156,
        totalDeposits: 45672341.25,
        pendingApplications: 12,
        monthlyTransactions: 8934,
        branchRevenue: 156789.50,
        customerSatisfaction: 4.7
    },
    branchCustomers: [
        {
            id: 1,
            name: "John Smith",
            email: "john.smith@email.com",
            phone: "+1 (555) 123-4567",
            accountNumber: "ACC-001234",
            accountType: "Premium",
            balance: 45650.75,
            joinDate: "2023-05-15",
            lastVisit: "2025-08-12",
            status: "active",
            riskScore: 2
        },
        {
            id: 2,
            name: "Maria Garcia",
            email: "maria.garcia@email.com",
            phone: "+1 (555) 234-5678",
            accountNumber: "ACC-002345",
            accountType: "Standard",
            balance: 12300.50,
            joinDate: "2024-01-10",
            lastVisit: "2025-08-14",
            status: "active",
            riskScore: 1
        },
        {
            id: 3,
            name: "Robert Johnson",
            email: "robert.j@email.com",
            phone: "+1 (555) 345-6789",
            accountNumber: "ACC-003456",
            accountType: "Business",
            balance: 125000.00,
            joinDate: "2022-03-20",
            lastVisit: "2025-08-15",
            status: "vip",
            riskScore: 1
        },
        {
            id: 4,
            name: "Emily Davis",
            email: "emily.davis@email.com",
            phone: "+1 (555) 456-7890",
            accountNumber: "ACC-004567",
            accountType: "Standard",
            balance: 8750.25,
            joinDate: "2024-07-08",
            lastVisit: "2025-08-10",
            status: "active",
            riskScore: 3
        },
        {
            id: 5,
            name: "Michael Brown",
            email: "michael.b@email.com",
            phone: "+1 (555) 567-8901",
            accountNumber: "ACC-005678",
            accountType: "Premium",
            balance: 67890.30,
            joinDate: "2023-11-15",
            lastVisit: "2025-08-13",
            status: "active",
            riskScore: 2
        }
    ],
    loanApplications: [
        {
            id: 1,
            customerName: "Sarah Wilson",
            email: "sarah.w@email.com",
            loanType: "Personal Loan",
            requestedAmount: 25000,
            purpose: "Home Improvement",
            creditScore: 720,
            monthlyIncome: 6500,
            status: "pending_review",
            submittedDate: "2025-08-10",
            priority: "medium"
        },
        {
            id: 2,
            customerName: "David Miller",
            email: "david.m@email.com",
            loanType: "Auto Loan",
            requestedAmount: 35000,
            purpose: "Vehicle Purchase",
            creditScore: 680,
            monthlyIncome: 5200,
            status: "pending_approval",
            submittedDate: "2025-08-08",
            priority: "low"
        },
        {
            id: 3,
            customerName: "Jennifer Taylor",
            email: "jennifer.t@email.com",
            loanType: "Mortgage",
            requestedAmount: 450000,
            purpose: "Home Purchase",
            creditScore: 780,
            monthlyIncome: 12000,
            status: "under_review",
            submittedDate: "2025-08-05",
            priority: "high"
        },
        {
            id: 4,
            customerName: "Thomas Anderson",
            email: "thomas.a@email.com",
            loanType: "Business Loan",
            requestedAmount: 75000,
            purpose: "Business Expansion",
            creditScore: 740,
            monthlyIncome: 8500,
            status: "documentation_required",
            submittedDate: "2025-08-12",
            priority: "high"
        }
    ],
    branchInfo: {
        name: "Downtown Branch",
        address: "123 Downtown Ave, City, ST 12345",
        phone: "+1 (555) 123-BANK",
        email: "downtown@bank.com",
        hours: "Mon-Fri: 9AM-5PM",
        manager: "Jane Smith"
    },
    recentReports: [
        {
            id: 1,
            title: "July 2025 Branch Report",
            generatedDate: "Aug 1, 2025",
            type: "monthly"
        },
        {
            id: 2,
            title: "Q2 Customer Analysis",
            generatedDate: "Jul 15, 2025",
            type: "quarterly"
        },
        {
            id: 3,
            title: "Loan Portfolio Review",
            generatedDate: "Jul 1, 2025",
            type: "portfolio"
        },
        {
            id: 4,
            title: "Risk Assessment Report",
            generatedDate: "Jun 15, 2025",
            type: "risk"
        }
    ]
};

export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return "$0.00";
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
};

export const formatNumber = (number) => {
    if (number === null || number === undefined || isNaN(number)) {
        return "0";
    }
    return new Intl.NumberFormat("en-US").format(number);
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

export const getStatusBadge = (status) => {
    const statusMap = {
        active: { class: "bg-success", text: "Active" },
        vip: { class: "bg-warning", text: "VIP" },
        inactive: { class: "bg-secondary", text: "Inactive" },
        pending: { class: "bg-warning", text: "Pending" },
        pending_review: { class: "bg-info", text: "Pending Review" },
        pending_approval: { class: "bg-warning", text: "Pending Approval" },
        under_review: { class: "bg-primary", text: "Under Review" },
        documentation_required: { class: "bg-danger", text: "Docs Required" },
        approved: { class: "bg-success", text: "Approved" },
        rejected: { class: "bg-danger", text: "Rejected" }
    };
    return statusMap[status] || { class: "bg-secondary", text: "Unknown" };
};

export const getPriorityBadge = (priority) => {
    const priorityMap = {
        high: { class: "bg-danger", text: "High" },
        medium: { class: "bg-warning", text: "Medium" },
        low: { class: "bg-success", text: "Low" }
    };
    return priorityMap[priority] || { class: "bg-secondary", text: "Unknown" };
};

export const getRiskScore = (score) => {
    const riskMap = {
        1: { class: "text-success", text: "Low Risk" },
        2: { class: "text-warning", text: "Medium Risk" },
        3: { class: "text-danger", text: "High Risk" }
    };
    return riskMap[score] || { class: "text-secondary", text: "Unknown" };
};

export const filterCustomers = (customers, searchTerm, statusFilter) => {
    if (!customers || !Array.isArray(customers)) {
        return [];
    }

    return customers.filter(customer => {
        if (!customer) return false;

        const safeSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';

        // Handle different possible property names and ensure they exist
        const customerName = customer.name ||
            (customer.first_name && customer.last_name ?
                `${customer.first_name} ${customer.last_name}` : '');
        const customerEmail = customer.email || '';
        const accountNumber = customer.accountNumber || customer.account_number || '';
        const username = customer.username || '';

        const matchesSearch = !safeSearchTerm ||
            customerName.toLowerCase().includes(safeSearchTerm) ||
            customerEmail.toLowerCase().includes(safeSearchTerm) ||
            accountNumber.toLowerCase().includes(safeSearchTerm) ||
            username.toLowerCase().includes(safeSearchTerm);

        const matchesFilter = statusFilter === "all" || customer.status === statusFilter ||
            (customer.is_active !== undefined && (
                (statusFilter === "active" && customer.is_active) ||
                (statusFilter === "inactive" && !customer.is_active)
            ));

        return matchesSearch && matchesFilter;
    });
};

export const getAccountTypeColor = (type) => {
    if (!type) return "secondary";

    const normalizedType = type.toLowerCase();
    const typeMap = {
        premium: "primary",
        standard: "info",
        business: "warning",
        savings: "success",
        checking: "primary",
        // Handle both formats
        Premium: "primary",
        Standard: "info",
        Business: "warning",
        Savings: "success"
    };
    return typeMap[type] || typeMap[normalizedType] || "secondary";
};

export const getCreditScoreColor = (score) => {
    if (score >= 750) return "success";
    if (score >= 650) return "warning";
    return "danger";
};

export const getLoanTypeIcon = (type) => {
    const typeMap = {
        "Personal Loan": "User",
        "Auto Loan": "Car",
        "Mortgage": "Home",
        "Business Loan": "Building",
        "Student Loan": "GraduationCap"
    };
    return typeMap[type] || "DollarSign";
};

export const calculateApprovalChance = (creditScore, monthlyIncome, requestedAmount) => {
    let chance = 50; // Base chance

    // Credit score factor
    if (creditScore >= 750) chance += 30;
    else if (creditScore >= 650) chance += 15;
    else chance -= 20;

    // Income to loan ratio
    const monthlyPayment = requestedAmount / 60; // Assume 5 year loan
    const ratio = monthlyPayment / monthlyIncome;

    if (ratio <= 0.1) chance += 20;
    else if (ratio <= 0.2) chance += 10;
    else if (ratio > 0.4) chance -= 30;

    return Math.max(0, Math.min(100, chance));
};

export const getBranchPerformanceColor = (rating) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
        return "secondary";
    }
    if (rating >= 4.5) return "success";
    if (rating >= 3.5) return "warning";
    return "danger";
};
