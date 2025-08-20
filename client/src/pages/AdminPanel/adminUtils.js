// Mock data and utility functions for AdminPanel components

export const mockAdminData = {
    systemStats: {
        totalUsers: 12547,
        activeUsers: 8932,
        totalTransactions: 45823,
        totalVolume: 23847562.45,
        newUsersToday: 47,
        transactionsToday: 1234,
        systemHealth: 98.5,
        alertsCount: 3
    },
    users: [
        {
            id: 1,
            name: "John Doe",
            email: "john.doe@email.com",
            status: "active",
            role: "customer",
            lastLogin: "2025-08-15 10:30",
            accounts: 3,
            totalBalance: 45650.75,
            joinDate: "2023-05-15",
            riskLevel: "low"
        },
        {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah.j@email.com",
            status: "suspended",
            role: "customer",
            lastLogin: "2025-08-14 16:22",
            accounts: 2,
            totalBalance: 12300.50,
            joinDate: "2024-01-10",
            riskLevel: "medium"
        },
        {
            id: 3,
            name: "Mike Wilson",
            email: "mike.w@email.com",
            status: "pending",
            role: "customer",
            lastLogin: "Never",
            accounts: 0,
            totalBalance: 0,
            joinDate: "2025-08-14",
            riskLevel: "low"
        },
        {
            id: 4,
            name: "Emma Davis",
            email: "emma.davis@email.com",
            status: "active",
            role: "branch_manager",
            lastLogin: "2025-08-15 09:15",
            accounts: 1,
            totalBalance: 8500.00,
            joinDate: "2022-03-20",
            riskLevel: "low"
        },
        {
            id: 5,
            name: "Robert Brown",
            email: "robert.b@email.com",
            status: "locked",
            role: "customer",
            lastLogin: "2025-08-12 14:45",
            accounts: 4,
            totalBalance: 125000.00,
            joinDate: "2021-11-05",
            riskLevel: "high"
        }
    ],
    recentActivity: [
        {
            id: 1,
            type: "user_registration",
            description: "New user registered: mike.w@email.com",
            timestamp: "2025-08-15 11:45",
            severity: "info"
        },
        {
            id: 2,
            type: "suspicious_activity",
            description: "Multiple failed login attempts detected for user robert.b@email.com",
            timestamp: "2025-08-15 11:30",
            severity: "warning"
        },
        {
            id: 3,
            type: "large_transaction",
            description: "Large transaction alert: $45,000 transfer by john.doe@email.com",
            timestamp: "2025-08-15 11:15",
            severity: "info"
        },
        {
            id: 4,
            type: "system_maintenance",
            description: "Scheduled system maintenance completed successfully",
            timestamp: "2025-08-15 03:00",
            severity: "success"
        },
        {
            id: 5,
            type: "account_suspended",
            description: "Account suspended: sarah.j@email.com (Risk assessment)",
            timestamp: "2025-08-14 16:30",
            severity: "warning"
        }
    ],
    systemAlerts: [
        {
            id: 1,
            title: "High Volume Detected",
            description: "Transaction volume is 150% above normal",
            timestamp: "2 hours ago",
            severity: "warning",
            type: "volume"
        },
        {
            id: 2,
            title: "Security Scan Complete",
            description: "Weekly security scan completed successfully",
            timestamp: "4 hours ago",
            severity: "info",
            type: "security"
        },
        {
            id: 3,
            title: "Backup Completed",
            description: "Daily backup completed successfully",
            timestamp: "6 hours ago",
            severity: "success",
            type: "backup"
        }
    ],
    systemServices: [
        { name: "Database", status: "online", health: 98 },
        { name: "API Services", status: "online", health: 97 },
        { name: "Payment Gateway", status: "online", health: 99 },
        { name: "Backup Systems", status: "active", health: 95 }
    ],
    performanceMetrics: {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 78,
        networkLoad: 23
    }
};

export const formatCurrency = (amount) => {
    // Handle null, undefined, NaN, and non-numeric values
    const numericAmount = Number(amount);
    if (!isFinite(numericAmount)) {
        return "$0.00";
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(numericAmount);
};

export const formatNumber = (number) => {
    // Handle null, undefined, NaN, and non-numeric values
    const numericValue = Number(number);
    if (!isFinite(numericValue)) {
        return "0";
    }
    return new Intl.NumberFormat("en-US").format(numericValue);
};

export const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export const getStatusBadge = (status) => {
    const statusMap = {
        active: { class: "bg-success", text: "Active" },
        suspended: { class: "bg-warning", text: "Suspended" },
        locked: { class: "bg-danger", text: "Locked" },
        pending: { class: "bg-info", text: "Pending" },
        online: { class: "bg-success", text: "Online" },
        offline: { class: "bg-danger", text: "Offline" },
        maintenance: { class: "bg-warning", text: "Maintenance" }
    };
    return statusMap[status] || { class: "bg-secondary", text: "Unknown" };
};

export const getRiskBadge = (level) => {
    const riskMap = {
        low: { class: "bg-success", text: "Low" },
        medium: { class: "bg-warning", text: "Medium" },
        high: { class: "bg-danger", text: "High" }
    };
    return riskMap[level] || { class: "bg-secondary", text: "Unknown" };
};

export const getSeverityInfo = (severity) => {
    const severityMap = {
        success: { class: "bg-success", textColor: "text-success" },
        warning: { class: "bg-warning", textColor: "text-warning" },
        error: { class: "bg-danger", textColor: "text-danger" },
        info: { class: "bg-info", textColor: "text-info" }
    };
    return severityMap[severity] || { class: "bg-secondary", textColor: "text-secondary" };
};

export const getHealthColor = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 70) return "warning";
    return "danger";
};

export const getUsageColor = (percentage) => {
    if (percentage >= 80) return "danger";
    if (percentage >= 60) return "warning";
    return "success";
};

export const filterUsers = (users, searchTerm, statusFilter) => {
    return users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesFilter;
    });
};

export const getUserStats = (users) => {
    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const suspended = users.filter(u => u.status === "suspended").length;
    const pending = users.filter(u => u.status === "pending").length;
    const locked = users.filter(u => u.status === "locked").length;

    return { total, active, suspended, pending, locked };
};

export const getActivityTypeIcon = (type) => {
    const typeMap = {
        user_registration: "UserPlus",
        suspicious_activity: "AlertTriangle",
        large_transaction: "DollarSign",
        system_maintenance: "Settings",
        account_suspended: "UserX",
        login: "LogIn",
        logout: "LogOut",
        transaction: "ArrowUpRight",
        security: "Shield"
    };
    return typeMap[type] || "Activity";
};
