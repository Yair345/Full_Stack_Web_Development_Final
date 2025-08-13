import { useState, useEffect } from "react";
import AccountsHeader from "./AccountsHeader";
import AccountsList from "./AccountsList";
import { mockAccounts } from "./accountUtils";

const Accounts = () => {
	const [accounts, setAccounts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Simulate API call with mock data
		const loadAccounts = async () => {
			try {
				setLoading(true);
				// Simulate network delay
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setAccounts(mockAccounts);
				setError(null);
			} catch (err) {
				setError("Failed to load accounts. Please try again.");
				console.error("Error loading accounts:", err);
			} finally {
				setLoading(false);
			}
		};

		loadAccounts();
	}, []);

	const handleOpenNewAccount = () => {
		// TODO: Navigate to new account page or open modal
		console.log("Opening new account...");
		// For now, just show an alert
		alert("New Account feature coming soon!");
	};

	return (
		<div className="row g-4">
			<AccountsHeader onOpenNewAccount={handleOpenNewAccount} />
			<AccountsList accounts={accounts} loading={loading} error={error} />
		</div>
	);
};

export default Accounts;
