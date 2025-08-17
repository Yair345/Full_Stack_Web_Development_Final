// Transform server transaction data to client format
export const transformServerTransaction = (serverTransaction, userAccountIds = []) => {
    if (!serverTransaction) return null;

    try {
        // Safely access transaction properties with defaults
        const fromAccountId = serverTransaction.from_account_id || null;
        const toAccountId = serverTransaction.to_account_id || null;
        const transactionType = serverTransaction.transaction_type || 'unknown';
        const transactionAmount = serverTransaction.amount || 0;

        // Determine if this is an incoming or outgoing transaction for the user
        const isIncoming = toAccountId && userAccountIds.includes(toAccountId) &&
            (!fromAccountId || !userAccountIds.includes(fromAccountId));
        const isOutgoing = fromAccountId && userAccountIds.includes(fromAccountId) &&
            (!toAccountId || !userAccountIds.includes(toAccountId));
        const isInternal = fromAccountId && toAccountId &&
            userAccountIds.includes(fromAccountId) && userAccountIds.includes(toAccountId);

        // Determine the transaction type for display
        let type = transactionType;
        let amount = transactionAmount;

        // Adjust amount based on transaction direction
        if (isOutgoing) {
            amount = -Math.abs(amount);
            type = 'debit';
        } else if (isIncoming) {
            amount = Math.abs(amount);
            type = 'credit';
        } else if (isInternal) {
            type = 'transfer';
        }

        // Determine merchant/counterparty and account info
        let merchant = 'Unknown';
        let account = 'Unknown Account';

        const fromAccount = serverTransaction.fromAccount;
        const toAccount = serverTransaction.toAccount;

        if (fromAccount && toAccount) {
            if (isOutgoing) {
                merchant = toAccount.User?.username ||
                    `Account ${toAccount.account_number || 'Unknown'}`;
                account = fromAccount.account_type ?
                    `${fromAccount.account_type} ****${(fromAccount.account_number || '').slice(-4)}` :
                    'Unknown Account';
            } else if (isIncoming) {
                merchant = fromAccount.User?.username ||
                    `Account ${fromAccount.account_number || 'Unknown'}`;
                account = toAccount.account_type ?
                    `${toAccount.account_type} ****${(toAccount.account_number || '').slice(-4)}` :
                    'Unknown Account';
            } else {
                merchant = 'Internal Transfer';
                account = fromAccount.account_type ?
                    `${fromAccount.account_type} ****${(fromAccount.account_number || '').slice(-4)}` :
                    'Unknown Account';
            }
        } else if (fromAccount && !toAccount) {
            // Withdrawal
            merchant = 'Cash Withdrawal';
            account = fromAccount.account_type ?
                `${fromAccount.account_type} ****${(fromAccount.account_number || '').slice(-4)}` :
                'Unknown Account';
        } else if (!fromAccount && toAccount) {
            // Deposit
            merchant = 'Cash Deposit';
            account = toAccount.account_type ?
                `${toAccount.account_type} ****${(toAccount.account_number || '').slice(-4)}` :
                'Unknown Account';
        }

        // Map transaction type to category
        const categoryMap = {
            'transfer': 'Transfer',
            'internal_transfer': 'Transfer',
            'external_transfer': 'Transfer',
            'deposit': 'Income',
            'withdrawal': 'Cash & ATM',
            'payment': 'Payment',
            'purchase': 'Shopping'
        };

        return {
            id: serverTransaction.id || Math.random().toString(36),
            type,
            amount,
            description: serverTransaction.description || `${transactionType} transaction`,
            merchant,
            date: serverTransaction.created_at || serverTransaction.processed_at || new Date().toISOString(),
            category: categoryMap[transactionType] || 'Other',
            account,
            status: serverTransaction.status || 'unknown',
            reference: serverTransaction.reference_number,
            rawData: serverTransaction // Keep original data for reference
        };
    } catch (error) {
        console.error('Error transforming transaction:', error, serverTransaction);
        // Return a basic fallback object
        return {
            id: serverTransaction.id || Math.random().toString(36),
            type: 'unknown',
            amount: serverTransaction.amount || 0,
            description: serverTransaction.description || 'Transaction',
            merchant: 'Unknown',
            date: serverTransaction.created_at || new Date().toISOString(),
            category: 'Other',
            account: 'Unknown Account',
            status: serverTransaction.status || 'unknown',
            reference: serverTransaction.reference_number,
            rawData: serverTransaction
        };
    }
};

// Transform array of server transactions
export const transformServerTransactions = (serverTransactions, userAccountIds = []) => {
    if (!Array.isArray(serverTransactions)) {
        console.warn('transformServerTransactions: Expected array, got:', typeof serverTransactions, serverTransactions);
        return [];
    }

    try {
        return serverTransactions.map(tx => transformServerTransaction(tx, userAccountIds)).filter(Boolean);
    } catch (error) {
        console.error('Error transforming transactions array:', error);
        return [];
    }
};

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
    // Helper function to escape CSV fields
    const escapeCSVField = (field) => {
        if (field == null) return '';
        const stringField = String(field);
        // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return '"' + stringField.replace(/"/g, '""') + '"';
        }
        return stringField;
    };

    const headers = ["Date", "Description", "Merchant", "Amount", "Type", "Category", "Account", "Status"];

    const csvRows = [
        headers.join(','),
        ...transactions.map((t) => [
            escapeCSVField(new Date(t.date).toLocaleDateString()),
            escapeCSVField(t.description),
            escapeCSVField(t.merchant),
            escapeCSVField(t.amount),
            escapeCSVField(t.type),
            escapeCSVField(t.category),
            escapeCSVField(t.account),
            escapeCSVField(t.status),
        ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); // Append to body for better browser compatibility
    a.click();
    document.body.removeChild(a); // Clean up
    window.URL.revokeObjectURL(url); // Clean up the URL object
};