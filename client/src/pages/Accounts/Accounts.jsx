import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import AccountsHeader from "./AccountsHeader";
import AccountsList from "./AccountsList";
import CreateAccountModal from "./CreateAccountModal";
import { useAccounts, useCreateAccount } from "../../hooks";
import { isTokenExpired, isTokenExpiringSoon } from "../../utils/tokenUtils";
import { formatCurrency } from "../../utils/helpers";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";
import Card from "../../components/ui/Card";

const Accounts = () => {
	const { accounts, loading, error, refetch } = useAccounts();
	const {
		mutate: createAccount,
		loading: creatingAccount,
		error: createError,
		reset: resetCreateState,
	} = useCreateAccount();
	const [successMessage, setSuccessMessage] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [tokenWarning, setTokenWarning] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastRefresh, setLastRefresh] = useState(null);

	// Get user info from Redux store
	const { user } = useSelector((state) => state.auth);

	// Handle manual refresh
	const handleRefresh = async () => {
		setIsRefreshing(true);
		
		// Clear any existing messages
		setSuccessMessage("");
		resetCreateState();
		
		try {
			await refetch();
			setLastRefresh(new Date());
			setSuccessMessage("Accounts refreshed successfully!");
			
			// Auto-hide success message after 3 seconds
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			console.error("Failed to refresh accounts:", error);
			
			// Show error message
			if (error.message.includes('expired') || error.message.includes('unauthorized')) {
				setTokenWarning("Your session has expired. Please log in again.");
				setTimeout(() => {
					window.location.href = '/login';
				}, 3000);
			} else {
				// You could add a specific refresh error state here if needed
				console.error("Refresh failed:", error.message);
			}
		} finally {
			setIsRefreshing(false);
		}
	};

	// Check token status on component mount and periodically
	useEffect(() => {
		const checkTokenStatus = () => {
			const token = localStorage.getItem('token');
			
			if (!token) {
				setTokenWarning("No authentication token found. Please log in again.");
				return;
			}

			if (isTokenExpired(token)) {
				setTokenWarning("Your session has expired. Please log in again.");
				setTimeout(() => {
					window.location.href = '/login';
				}, 3000);
				return;
			}

			if (isTokenExpiringSoon(token)) {
				setTokenWarning("Your session will expire soon. Please save your work.");
			} else {
				setTokenWarning("");
			}
		};

		// Check immediately
		checkTokenStatus();

		// Check every minute
		const interval = setInterval(checkTokenStatus, 60000);

		return () => clearInterval(interval);
	}, []);

	// Add keyboard shortcut for refresh (Ctrl+R or F5)
	useEffect(() => {
		const handleKeyDown = (event) => {
			// Prevent default browser refresh and use our refresh function instead
			if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
				event.preventDefault();
				if (!isRefreshing) {
					handleRefresh();
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isRefreshing]);

	const handleOpenNewAccount = () => {
		// Check token before opening modal
		const token = localStorage.getItem('token');
		if (!token || isTokenExpired(token)) {
			alert("Your session has expired. Please log in again.");
			window.location.href = '/login';
			return;
		}

		// Clear any previous messages
		setSuccessMessage("");
		resetCreateState();
		setIsCreateModalOpen(true);
	};

	const handleCreateAccount = async (accountData) => {
		try {
			await createAccount(accountData);

			setSuccessMessage("Account created successfully!");
			setIsCreateModalOpen(false);

			// Refresh accounts list after successful creation
			setIsRefreshing(true);
			try {
				await refetch();
			} catch (refreshError) {
				console.error("Failed to refresh accounts after creation:", refreshError);
			} finally {
				setIsRefreshing(false);
			}

			// Auto-hide success message after 5 seconds
			setTimeout(() => setSuccessMessage(""), 5000);
		} catch (error) {
			console.error("Failed to create account:", error);
			// Error will be displayed through createError state or modal
			throw error;
		}
	};

	// Calculate account statistics
	const getAccountStats = () => {
		if (!accounts || accounts.length === 0) {
			return {
				totalBalance: 0,
				totalAccounts: 0,
				activeAccounts: 0,
				totalAvailable: 0
			};
		}

		const stats = accounts.reduce((acc, account) => {
			acc.totalBalance += account.balance || 0;
			acc.totalAccounts += 1;
			
			if (account.status === 'active') {
				acc.activeAccounts += 1;
			}
			
			// Calculate available balance (including overdraft for checking accounts)
			if (account.type === 'checking' && account.limit) {
				acc.totalAvailable += (account.balance || 0) + (account.limit || 0);
			} else {
				acc.totalAvailable += account.balance || 0;
			}
			
			return acc;
		}, {
			totalBalance: 0,
			totalAccounts: 0,
			activeAccounts: 0,
			totalAvailable: 0
		});

		return stats;
	};

	const accountStats = getAccountStats();

	return (
		<div className="row g-4">
			{/* Token Warning */}
			{tokenWarning && (
				<div className="col-12">
					<div className="alert alert-warning alert-dismissible fade show" role="alert">
						<i className="bi bi-exclamation-triangle-fill me-2"></i>
						<strong>Session Warning:</strong> {tokenWarning}
						<button
							type="button"
							className="btn-close"
							onClick={() => setTokenWarning("")}
							aria-label="Close"
						></button>
					</div>
				</div>
			)}

			{/* Success Message */}
			{successMessage && (
				<div className="col-12">
					<div
						className="alert alert-success alert-dismissible fade show"
						role="alert"
					>
						<i className="bi bi-check-circle-fill me-2"></i>
						{successMessage}
						<button
							type="button"
							className="btn-close"
							onClick={() => setSuccessMessage("")}
							aria-label="Close"
						></button>
					</div>
				</div>
			)}

			{/* Create Account Error */}
			{createError && (
				<div className="col-12">
					<div
						className="alert alert-danger alert-dismissible fade show"
						role="alert"
					>
						<i className="bi bi-exclamation-triangle-fill me-2"></i>
						<strong>Failed to create account:</strong> {createError}
						<button
							type="button"
							className="btn-close"
							onClick={resetCreateState}
							aria-label="Close"
						></button>
					</div>
				</div>
			)}

			<AccountsHeader 
				onOpenNewAccount={handleOpenNewAccount}
				onRefresh={handleRefresh}
				userInfo={user}
				isRefreshing={isRefreshing}
				lastRefresh={lastRefresh}
			/>

			{/* Account Statistics */}
			{accounts && accounts.length > 0 && (
				<div className="col-12 mb-4">
					<div className="row g-3">
						<div className="col-md-3">
							<Card className="text-center">
								<div className="d-flex align-items-center justify-content-center mb-2">
									<DollarSign className="text-primary me-2" size={24} />
									<h6 className="mb-0 text-muted">Total Balance</h6>
								</div>
								<h4 className="fw-bold text-dark mb-0">
									{formatCurrency(accountStats.totalBalance)}
								</h4>
							</Card>
						</div>
						<div className="col-md-3">
							<Card className="text-center">
								<div className="d-flex align-items-center justify-content-center mb-2">
									<TrendingUp className="text-success me-2" size={24} />
									<h6 className="mb-0 text-muted">Available</h6>
								</div>
								<h4 className="fw-bold text-success mb-0">
									{formatCurrency(accountStats.totalAvailable)}
								</h4>
							</Card>
						</div>
						<div className="col-md-3">
							<Card className="text-center">
								<div className="d-flex align-items-center justify-content-center mb-2">
									<CreditCard className="text-info me-2" size={24} />
									<h6 className="mb-0 text-muted">Accounts</h6>
								</div>
								<h4 className="fw-bold text-dark mb-0">
									{accountStats.totalAccounts}
								</h4>
								<small className="text-muted">
									{accountStats.activeAccounts} active
								</small>
							</Card>
						</div>
						<div className="col-md-3">
							<Card className="text-center">
								<div className="d-flex align-items-center justify-content-center mb-2">
									<div className={`rounded-circle p-2 me-2 ${
										accountStats.activeAccounts === accountStats.totalAccounts 
											? 'bg-success-subtle' 
											: 'bg-warning-subtle'
									}`}>
										<div className={`rounded-circle ${
											accountStats.activeAccounts === accountStats.totalAccounts 
												? 'bg-success' 
												: 'bg-warning'
										}`} style={{width: '12px', height: '12px'}}></div>
									</div>
									<h6 className="mb-0 text-muted">Status</h6>
								</div>
								<h6 className={`fw-bold mb-0 ${
									accountStats.activeAccounts === accountStats.totalAccounts 
										? 'text-success' 
										: 'text-warning'
								}`}>
									{accountStats.activeAccounts === accountStats.totalAccounts 
										? 'All Active' 
										: 'Some Inactive'
									}
								</h6>
							</Card>
						</div>
					</div>
				</div>
			)}

			<AccountsList
				accounts={accounts}
				loading={loading || creatingAccount || isRefreshing}
				error={error}
			/>

			{/* Create Account Modal */}
			<CreateAccountModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreateAccount}
			/>
		</div>
	);
};

export default Accounts;
