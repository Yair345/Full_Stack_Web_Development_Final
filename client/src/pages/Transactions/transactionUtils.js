// Determine if transaction is income or expense based on context
// This function properly categorizes transactions to distinguish between money coming in (income) 
// and money going out (expenses) from the user's perspective:
// - Stock purchases: Always expenses (money goes out to buy stocks)
// - Stock sales: Always income (money comes in from selling stocks)
// - Deposits: Income (money coming into user's account)
// - Withdrawals/Payments: Expenses (money going out of user's account)
// - Transfers: Based on direction (incoming = income, outgoing = expense)
export const categorizeTransaction = (transaction) => {
    const amount = Math.abs(transaction.amount);
    const metadata = transaction.metadata || {};

    // Check for stock transactions first
    if (metadata.transactionType === 'STOCK_PURCHASE') {
        // Stock purchase is always an expense (money going out)
        return {
            amount: amount,
            isIncome: false,
            category: 'expense'
        };
    }

    if (metadata.transactionType === 'STOCK_SALE') {
        // Stock sale is always income (money coming in)
        return {
            amount: amount,
            isIncome: true,
            category: 'income'
        };
    }

    // Handle other transaction types
    switch (transaction.transaction_type) {
        case "deposit":
            // Money coming into user's account = income
            return {
                amount: amount,
                isIncome: true,
                category: 'income'
            };

        case "withdrawal":
        case "payment":
            // Money going out of user's account = expense
            return {
                amount: amount,
                isIncome: false,
                category: 'expense'
            };

        case "transfer":
            // For transfers, check if money is coming in or going out
            // If user is sender (fromAccount exists) = expense
            // If user is receiver (toAccount exists) = income
            if (transaction.fromAccount && !transaction.toAccount) {
                // Money going out = expense
                return {
                    amount: amount,
                    isIncome: false,
                    category: 'expense'
                };
            } else if (transaction.toAccount && !transaction.fromAccount) {
                // Money coming in = income
                return {
                    amount: amount,
                    isIncome: true,
                    category: 'income'
                };
            } else {
                // Internal transfer - categorize based on original amount sign
                const isPositive = transaction.amount >= 0;
                return {
                    amount: amount,
                    isIncome: isPositive,
                    category: isPositive ? 'income' : 'expense'
                };
            }

        default:
            // Fallback to original logic based on amount sign
            const isPositive = transaction.amount >= 0;
            return {
                amount: amount,
                isIncome: isPositive,
                category: isPositive ? 'income' : 'expense'
            };
    }
};

// Get transaction flow description (From Account → To Account)
export const getTransactionFlow = (transaction) => {
    const metadata = transaction.metadata || {};

    // Handle stock transactions
    if (metadata.transactionType === 'STOCK_PURCHASE') {
        const fromAccount = transaction.fromAccount?.name ||
            `Account ${transaction.fromAccount?.account_number || 'Unknown'}`;
        return {
            from: fromAccount,
            to: `Stock Market (${metadata.stockSymbol})`,
            description: `${fromAccount} → Stock Market (${metadata.stockSymbol})`
        };
    }

    if (metadata.transactionType === 'STOCK_SALE') {
        const toAccount = transaction.toAccount?.name ||
            `Account ${transaction.toAccount?.account_number || 'Unknown'}`;
        return {
            from: `Stock Market (${metadata.stockSymbol})`,
            to: toAccount,
            description: `Stock Market (${metadata.stockSymbol}) → ${toAccount}`
        };
    }

    // Handle regular transactions
    const fromAccount = transaction.fromAccount;
    const toAccount = transaction.toAccount;

    if (fromAccount && toAccount) {
        // Internal or external transfer
        const fromName = fromAccount.User?.username || fromAccount.name ||
            `Account ${fromAccount.account_number || 'Unknown'}`;
        const toName = toAccount.User?.username || toAccount.name ||
            `Account ${toAccount.account_number || 'Unknown'}`;

        return {
            from: fromName,
            to: toName,
            description: `${fromName} → ${toName}`
        };
    }

    if (fromAccount && !toAccount) {
        // Withdrawal/Payment
        const fromName = fromAccount.name || `Account ${fromAccount.account_number || 'Unknown'}`;

        switch (transaction.transaction_type) {
            case 'withdrawal':
                return {
                    from: fromName,
                    to: 'Cash/ATM',
                    description: `${fromName} → Cash/ATM`
                };
            case 'payment':
                return {
                    from: fromName,
                    to: 'External Payment',
                    description: `${fromName} → External Payment`
                };
            default:
                return {
                    from: fromName,
                    to: 'External',
                    description: `${fromName} → External`
                };
        }
    }

    if (!fromAccount && toAccount) {
        // Deposit
        const toName = toAccount.name || `Account ${toAccount.account_number || 'Unknown'}`;

        switch (transaction.transaction_type) {
            case 'deposit':
                return {
                    from: 'External Deposit',
                    to: toName,
                    description: `External Deposit → ${toName}`
                };
            default:
                return {
                    from: 'External',
                    to: toName,
                    description: `External → ${toName}`
                };
        }
    }

    // Fallback for unknown transaction structure
    return {
        from: 'Unknown',
        to: 'Unknown',
        description: 'Unknown → Unknown'
    };
};

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
                (transaction.description || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (transaction.merchant || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (transaction.category || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (transaction.transaction_ref || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
    }

    // Type filter - use our categorization system
    if (filters.type && filters.type !== "all") {
        filtered = filtered.filter((transaction) => {
            const metadata = transaction.metadata || {};

            // Handle special filter categories
            if (filters.type === "income") {
                const categorized = categorizeTransaction(transaction);
                return categorized.isIncome;
            }

            if (filters.type === "expense") {
                const categorized = categorizeTransaction(transaction);
                return !categorized.isIncome;
            }

            if (filters.type === "stock_purchase") {
                return metadata.transactionType === 'STOCK_PURCHASE';
            }

            if (filters.type === "stock_sale") {
                return metadata.transactionType === 'STOCK_SALE';
            }

            // Handle regular transaction types
            return transaction.transaction_type === filters.type;
        });
    }

    // Date range filter
    if (filters.dateFrom) {
        filtered = filtered.filter(
            (transaction) => {
                const transactionDate = transaction.created_at || transaction.createdAt || transaction.date;
                return new Date(transactionDate) >= new Date(filters.dateFrom);
            }
        );
    }

    if (filters.dateTo) {
        filtered = filtered.filter(
            (transaction) => {
                const transactionDate = transaction.created_at || transaction.createdAt || transaction.date;
                return new Date(transactionDate) <= new Date(filters.dateTo);
            }
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
    return filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || a.date);
        const dateB = new Date(b.created_at || b.createdAt || b.date);
        return dateB - dateA;
    });
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

    // Helper function to get account display for CSV (same logic as TransactionItem)
    const getAccountForCSV = (transaction) => {
        if (transaction.toAccount) {
            return `${transaction.toAccount.name || 'Account'} (${transaction.toAccount.account_number})`;
        } else if (transaction.fromAccount) {
            return `${transaction.fromAccount.name || 'Account'} (${transaction.fromAccount.account_number})`;
        }
        // Fallback to legacy format if available
        return transaction.account || 'Unknown Account';
    };

    // Helper function to get transaction type display
    const getTypeForCSV = (transaction) => {
        return transaction.transaction_type || transaction.type || 'unknown';
    };

    // Helper function to get description
    const getDescriptionForCSV = (transaction) => {
        return transaction.description || transaction.merchant || 'No description';
    };

    // Helper function to format date
    const getDateForCSV = (transaction) => {
        const date = transaction.created_at || transaction.createdAt || transaction.date;
        return date ? new Date(date).toLocaleDateString() : 'Unknown Date';
    };

    const headers = ["Date", "Description", "Reference", "Amount", "Type", "Transaction Flow", "From Account", "To Account", "Status"];

    const csvRows = [
        headers.join(','),
        ...transactions.map((t) => {
            const flow = getTransactionFlow(t);
            return [
                escapeCSVField(getDateForCSV(t)),
                escapeCSVField(getDescriptionForCSV(t)),
                escapeCSVField(t.transaction_ref || t.reference || ''),
                escapeCSVField(t.amount || 0),
                escapeCSVField(getTypeForCSV(t)),
                escapeCSVField(flow.description),
                escapeCSVField(flow.from),
                escapeCSVField(flow.to),
                escapeCSVField(t.status || 'unknown'),
            ].join(',');
        })
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