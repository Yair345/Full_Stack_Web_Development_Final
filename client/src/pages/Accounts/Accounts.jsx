import { useState } from "react";
import AccountsHeader from "./AccountsHeader";
import AccountsList from "./AccountsList";
import { useAccounts, useCreateAccount } from "../../hooks";

const Accounts = () => {
	const { accounts, loading, error, refetch } = useAccounts();
	const {
		mutate: createAccount,
		loading: creatingAccount,
		error: createError,
		reset: resetCreateState,
	} = useCreateAccount();
	const [successMessage, setSuccessMessage] = useState("");

	const handleOpenNewAccount = async () => {
		try {
			// Clear any previous messages
			setSuccessMessage("");
			resetCreateState();

			// TODO: Implement proper new account form/modal
			// For now, create a basic checking account
			const newAccountData = {
				account_type: "checking",
				currency: "USD", // Default currency
			};

			await createAccount(newAccountData);

			// Refresh accounts list after successful creation
			await refetch();

			setSuccessMessage("Account created successfully!");

			// Auto-hide success message after 5 seconds
			setTimeout(() => setSuccessMessage(""), 5000);
		} catch (error) {
			console.error("Failed to create account:", error);
			// Error will be displayed through createError state
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

			<AccountsHeader onOpenNewAccount={handleOpenNewAccount} />
			<AccountsList
				accounts={accounts}
				loading={loading || creatingAccount}
				error={error}
			/>
		</div>
	);
};

export default Accounts;
