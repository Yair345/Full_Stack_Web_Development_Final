// Mock transaction data for demo
export const mockTransactions = [
    {
        id: 1,
        type: "debit",
        amount: -85.5,
        description: "Grocery Store Purchase",
        merchant: "Fresh Market",
        date: "2024-08-13T10:30:00Z",
        category: "Food & Dining",
        account: "Checking ****1234",
        status: "completed",
    },
    {
        id: 2,
        type: "credit",
        amount: 2500.0,
        description: "Salary Deposit",
        merchant: "ABC Corporation",
        date: "2024-08-12T09:00:00Z",
        category: "Income",
        account: "Checking ****1234",
        status: "completed",
    },
    {
        id: 3,
        type: "debit",
        amount: -45.99,
        description: "Gas Station",
        merchant: "Shell Station",
        date: "2024-08-11T16:45:00Z",
        category: "Transportation",
        account: "Checking ****1234",
        status: "completed",
    },
    {
        id: 4,
        type: "debit",
        amount: -1200.0,
        description: "Rent Payment",
        merchant: "Property Management Co",
        date: "2024-08-01T08:00:00Z",
        category: "Housing",
        account: "Checking ****1234",
        status: "completed",
    },
    {
        id: 5,
        type: "transfer",
        amount: -500.0,
        description: "Transfer to Savings",
        merchant: "Internal Transfer",
        date: "2024-07-30T14:20:00Z",
        category: "Transfer",
        account: "Checking ****1234",
        status: "completed",
    },
    {
        id: 6,
        type: "debit",
        amount: -23.75,
        description: "Coffee Shop",
        merchant: "Starbucks",
        date: "2024-07-29T07:30:00Z",
        category: "Food & Dining",
        account: "Credit ****9012",
        status: "pending",
    },
];

// Filter transactions based on search and filters
export const filterTransactions = (transactions, searchTerm, filters) => {
    // Create a copy of the transactions array to avoid mutating Redux state
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(
            (transaction) =>
                transaction.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                transaction.merchant
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                transaction.category
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
    }

    // Type filter
    if (filters.type !== "all") {
        filtered = filtered.filter(
            (transaction) => transaction.type === filters.type
        );
    }

    // Date range filter
    if (filters.dateFrom) {
        filtered = filtered.filter(
            (transaction) =>
                new Date(transaction.date) >= new Date(filters.dateFrom)
        );
    }

    if (filters.dateTo) {
        filtered = filtered.filter(
            (transaction) =>
                new Date(transaction.date) <= new Date(filters.dateTo)
        );
    }

    // Amount range filter
    if (filters.minAmount) {
        filtered = filtered.filter(
            (transaction) =>
                Math.abs(transaction.amount) >= parseFloat(filters.minAmount)
        );
    }

    if (filters.maxAmount) {
        filtered = filtered.filter(
            (transaction) =>
                Math.abs(transaction.amount) <= parseFloat(filters.maxAmount)
        );
    }

    // Sort by date (newest first) - create a new sorted array
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Export transactions to CSV
export const exportTransactions = (transactions) => {
    const csvContent = [
        ["Date", "Description", "Amount", "Type", "Category", "Status"],
        ...transactions.map((t) => [
            new Date(t.date).toLocaleDateString(),
            t.description,
            t.amount,
            t.type,
            t.category,
            t.status,
        ]),
    ]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
};
