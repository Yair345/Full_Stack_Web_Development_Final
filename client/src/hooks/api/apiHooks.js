// Core API hooks
export { useApi, useMutation, useInfiniteApi } from './core/useApiCore';

// Account-related hooks
export {
    useAccounts,
    useAccount,
    useCreateAccount,
    useUpdateAccount,
} from './features/useAccountHooks';

// Transaction-related hooks
export {
    useTransactions,
    useInfiniteTransactions,
    useTransaction,
    useCreateTransaction,
    useCreateTransfer,
    useCreateDeposit,
    useCreateWithdrawal,
    useCancelTransaction,
    useTransactionSummary,
} from './features/useTransactionHooks';

// Authentication hooks
export { useAuthMutations } from './features/useAuthHooks';

// Standing Order hooks
export {
    useStandingOrders,
    useStandingOrder,
    useCreateStandingOrder,
    useUpdateStandingOrder,
    useToggleStandingOrder,
    useCancelStandingOrder,
} from './features/useStandingOrderHooks';

// Card hooks
export {
    useCards,
    useCard,
    useCreateCard,
    useUpdateCard,
    useToggleCardBlock,
    useCancelCard,
    useChangeCardPin,
} from './features/useCardHooks';

// Recipients hooks
export {
    useRecentRecipients,
} from './features/useRecipientsHooks';

// Dashboard and utility hooks
export {
    useDashboard,
    usePolling,
} from './features/useDashboardHooks';

// Branch hooks
export {
    useBranches,
    useBranch,
    useBranchCustomers,
    useBranchStats,
    useBranchLoans,
    useCreateBranch,
    useUpdateBranch,
    useDeleteBranch,
    useBranchOperations,
} from './features/useBranchHooks';
