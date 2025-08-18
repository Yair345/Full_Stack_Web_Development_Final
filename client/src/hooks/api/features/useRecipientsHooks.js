import { useTransactions } from './useTransactionHooks';
import { useMemo } from 'react';

/**
 * Hook for getting recent recipients from transaction history
 * @param {Object} options - Configuration options
 * @returns {Object} - { recipients, loading, error }
 */
export const useRecentRecipients = (options = {}) => {
    // Get recent external transactions to extract recipients
    const { transactions, loading, error } = useTransactions({
        type: 'transfer',
        limit: 50 // Get more to have a good pool of recipients
    }, options);

    const recipients = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return [];
        }

        // Extract unique recipients from transactions
        const recipientMap = new Map();

        transactions.forEach(transaction => {
            // Only include external transfers where we were the sender
            if (transaction.transaction_type === 'external_transfer' &&
                transaction.fromAccount &&
                transaction.toAccount) {

                const recipientKey = transaction.toAccount.account_number;
                const recipientName = transaction.toAccount.user?.username ||
                    transaction.description ||
                    'Unknown Recipient';

                if (!recipientMap.has(recipientKey)) {
                    recipientMap.set(recipientKey, {
                        id: recipientKey,
                        name: recipientName,
                        accountNumber: transaction.toAccount.account_number,
                        bank: 'External Bank', // Could be enhanced with bank lookup
                        lastTransfer: transaction.created_at,
                        type: 'external'
                    });
                } else {
                    // Update last transfer date if more recent
                    const existing = recipientMap.get(recipientKey);
                    if (new Date(transaction.created_at) > new Date(existing.lastTransfer)) {
                        existing.lastTransfer = transaction.created_at;
                    }
                }
            }
        });

        // Convert map to array and sort by most recent
        return Array.from(recipientMap.values())
            .sort((a, b) => new Date(b.lastTransfer) - new Date(a.lastTransfer))
            .slice(0, 10); // Return top 10 recent recipients
    }, [transactions]);

    return {
        recipients,
        loading,
        error
    };
};
