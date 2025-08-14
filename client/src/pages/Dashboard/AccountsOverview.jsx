import { CreditCard, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
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
				return <BarChart3 size={24} className="text-info" />;
			default:
				return <CreditCard size={24} className="text-secondary" />;
		}
	};

	const getBalanceDisplay = () => {
		if (account.type === "credit") {
			const available = (account.limit || 0) + account.balance;
			return (
				<div className="text-end">
					<p className="h6 fw-semibold mb-0 text-dark">
						{formatCurrency(available)} available
					</p>
					<p className="small text-muted mb-0">
						Limit: {formatCurrency(account.limit)}
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
							{account.number}
						</p>
					</div>
				</div>
				{getBalanceDisplay()}
			</div>
		</div>
	);
};

const AccountsOverview = ({ accounts }) => {
	return (
		<div className="col-12">
			<Card>
				<div className="d-flex align-items-center justify-content-between mb-4">
					<h2 className="h5 fw-medium mb-0">Your Accounts</h2>
					<button className="btn btn-link text-primary p-0 small">
						Manage accounts
					</button>
				</div>
				<div className="row g-3">
					{accounts.map((account) => (
						<div key={account.id} className="col-12">
							<AccountCard account={account} />
						</div>
					))}
				</div>

				{accounts.length === 0 && (
					<div className="text-center py-4">
						<CreditCard size={48} className="text-muted mb-3" />
						<p className="text-muted">No accounts found</p>
						<button className="btn btn-primary btn-sm">
							Add Account
						</button>
					</div>
				)}
			</Card>
		</div>
	);
};

export default AccountsOverview;
