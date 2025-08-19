import { CreditCard, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import { formatCurrency, getAccountTypeColor } from "./dashboardUtils";

const AccountCard = ({ account }) => {
	const getAccountIcon = (type) => {
		switch (type) {
			case "checking":
				return <CreditCard size={24} className="text-primary" />;
			case "savings":
				return <TrendingUp size={24} className="text-success" />;
			case "credit":
				return <DollarSign size={24} className="text-warning" />;
			case "investment":
			case "business":
				return <BarChart3 size={24} className="text-info" />;
			default:
				return <CreditCard size={24} className="text-secondary" />;
		}
	};

	const getBalanceDisplay = () => {
		if (account.type === "credit") {
			const limit = account.limit || account.overdraft_limit || 0;
			const available = limit + account.balance; // balance is negative for credit debt
			return (
				<div className="text-end">
					<p className="h6 fw-semibold mb-0 text-dark">
						{formatCurrency(available)} available
					</p>
					<p className="small text-muted mb-0">
						Limit: {formatCurrency(limit)}
					</p>
					{account.balance < 0 && (
						<p className="small text-danger mb-0">
							Balance: {formatCurrency(account.balance)}
						</p>
					)}
				</div>
			);
		}

		return (
			<div className="text-end">
				<p
					className={`h6 fw-semibold mb-0 ${
						account.balance >= 0 ? "text-dark" : "text-danger"
					}`}
				>
					{formatCurrency(account.balance)}
				</p>
			</div>
		);
	};

	// Get account number display - handle both formats
	const getAccountNumber = () => {
		if (account.number && account.number.includes("****")) {
			return account.number;
		}
		// For real API data, format the account number
		const accountNumber = account.account_number || account.number || "";
		if (accountNumber.length >= 4) {
			return `****${accountNumber.slice(-4)}`;
		}
		return accountNumber || "****0000";
	};

	return (
		<div className="border rounded p-3 hover-bg-light transition-colors">
			<div className="d-flex align-items-center justify-content-between">
				<div className="d-flex align-items-center">
					<div className="flex-shrink-0">
						{getAccountIcon(account.type)}
					</div>
					<div className="ms-3">
						<p className="fw-medium mb-1">{account.name}</p>
						<p className="small text-muted mb-0">
							{getAccountNumber()}
						</p>
					</div>
				</div>
				{getBalanceDisplay()}
			</div>
		</div>
	);
};

const AccountsOverview = ({ accounts }) => {
	const navigate = useNavigate();

	// Ensure accounts is always an array
	const accountsList = Array.isArray(accounts) ? accounts : [];

	const handleManageAccounts = () => {
		navigate("/accounts");
	};

	const handleAddAccount = () => {
		navigate("/accounts/new");
	};

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex align-items-center justify-content-between mb-4">
					<h2 className="h5 fw-medium mb-0">Your Accounts</h2>
					{accountsList.length > 0 && (
						<button
							className="btn btn-link text-primary p-0 small"
							onClick={handleManageAccounts}
						>
							Manage accounts
						</button>
					)}
				</div>
				<div className="row g-3">
					{accountsList.map((account) => (
						<div key={account.id} className="col-12">
							<AccountCard account={account} />
						</div>
					))}
				</div>

				{accountsList.length === 0 && (
					<div className="text-center py-4">
						<CreditCard size={48} className="text-muted mb-3" />
						<p className="text-muted">No accounts found</p>
						<button
							className="btn btn-primary btn-sm"
							onClick={handleAddAccount}
						>
							Add Account
						</button>
					</div>
				)}
			</Card>
		</div>
	);
};

export default AccountsOverview;
