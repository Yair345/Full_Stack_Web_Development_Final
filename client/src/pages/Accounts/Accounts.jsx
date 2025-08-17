import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import AccountsHeader from "./AccountsHeader";
import AccountsList from "./AccountsList";
import AccountsStats from "./AccountsStats";
import CreateAccountModal from "./CreateAccountModal";
import { useAccounts, useCreateAccount } from "../../hooks";
import { formatCurrency } from "../../utils/helpers";

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
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastRefresh, setLastRefresh] = useState(null);

	// Get user
	const { user } = useSelector((state) => state.auth);

	// Handle manual refresh
	const handleRefresh = async () => {
		setIsRefreshing(true);

		// Clear any existing messages
		setSuccessMessage("");
		resetCreateState();

		try {
			console.log("Starting manual refresh...");

			// Force refetch
			const result = await refetch();
			console.log("Refresh result:", result);

			setLastRefresh(new Date());
			setSuccessMessage("Accounts refreshed successfully!");

			// Auto-hide success message after 3 seconds
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			console.error("Failed to refresh accounts:", error);
			setSuccessMessage("Failed to refresh accounts. Please try again.");

			// Auto-hide error message after 5 seconds
			setTimeout(() => setSuccessMessage(""), 5000);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleOpenNewAccount = () => {
		// Clear any previous messages
		setSuccessMessage("");
		resetCreateState();
		setIsCreateModalOpen(true);
	};

	const handleCreateAccount = async (accountData) => {
		try {
			console.log("Creating account with data:", accountData);
			const result = await createAccount(accountData);
			console.log("Account creation result:", result);

			setSuccessMessage("Account created successfully!");
			setIsCreateModalOpen(false);

			// Refresh accounts list after successful creation
			console.log("Refreshing accounts after creation...");
			setIsRefreshing(true);
			try {
				const refreshResult = await refetch();
				console.log("Post-creation refresh result:", refreshResult);
			} catch (refreshError) {
				console.error(
					"Failed to refresh accounts after creation:",
					refreshError
				);
				// Show a message suggesting manual refresh
				setSuccessMessage(
					"Account created successfully! Please refresh manually to see the new account."
				);
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

	return (
		<div className="row g-4">
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
			<AccountsStats accounts={accounts} />

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
