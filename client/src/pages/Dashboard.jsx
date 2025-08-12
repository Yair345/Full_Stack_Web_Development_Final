import { useSelector } from "react-redux";
import {
	CreditCard,
	TrendingUp,
	ArrowUpRight,
	ArrowDownRight,
	DollarSign,
} from "lucide-react";
import Card from "../components/ui/Card";

const Dashboard = () => {
	const { user } = useSelector((state) => state.auth);

	// Mock data for demonstration
	const accounts = [
		{
			id: 1,
			name: "Checking Account",
			type: "checking",
			balance: 2500.75,
			number: "****1234",
		},
		{
			id: 2,
			name: "Savings Account",
			type: "savings",
			balance: 15000.0,
			number: "****5678",
		},
		{
			id: 3,
			name: "Credit Card",
			type: "credit",
			balance: -1200.5,
			number: "****9012",
			limit: 5000,
		},
	];

	const recentTransactions = [
		{
			id: 1,
			description: "Grocery Store",
			amount: -85.32,
			date: "2025-08-12",
			type: "debit",
		},
		{
			id: 2,
			description: "Salary Deposit",
			amount: 3200.0,
			date: "2025-08-10",
			type: "credit",
		},
		{
			id: 3,
			description: "Electric Bill",
			amount: -120.45,
			date: "2025-08-09",
			type: "debit",
		},
		{
			id: 4,
			description: "ATM Withdrawal",
			amount: -100.0,
			date: "2025-08-08",
			type: "debit",
		},
	];

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const getAccountIcon = (type) => {
		switch (type) {
			case "checking":
				return <CreditCard size={24} className="text-primary" />;
			case "savings":
				return <TrendingUp size={24} className="text-success" />;
			case "credit":
				return <DollarSign size={24} className="text-warning" />;
			default:
				return <CreditCard size={24} className="text-secondary" />;
		}
	};

	return (
		<div className="row g-4">
			{/* Welcome Section */}
			<div className="col-12">
				<div className="bg-gradient-primary rounded p-4 text-white">
					<h1 className="h3 fw-bold mb-2">
						Welcome back, {user?.firstName}!
					</h1>
					<p className="mb-0 opacity-75">
						Here's an overview of your accounts and recent activity.
					</p>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="col-12">
				<div className="row g-3">
					<div className="col-md-4">
						<Card>
							<div className="d-flex align-items-center">
								<div className="flex-shrink-0">
									<TrendingUp
										size={32}
										className="text-success"
									/>
								</div>
								<div className="ms-3">
									<p className="small text-muted mb-1">
										Total Balance
									</p>
									<p className="h4 fw-bold mb-0">
										{formatCurrency(
											accounts.reduce(
												(sum, acc) => sum + acc.balance,
												0
											)
										)}
									</p>
								</div>
							</div>
						</Card>
					</div>

					<div className="col-md-4">
						<Card>
							<div className="d-flex align-items-center">
								<div className="flex-shrink-0">
									<CreditCard
										size={32}
										className="text-primary"
									/>
								</div>
								<div className="ms-3">
									<p className="small text-muted mb-1">
										Active Accounts
									</p>
									<p className="h4 fw-bold mb-0">
										{accounts.length}
									</p>
								</div>
							</div>
						</Card>
					</div>

					<div className="col-md-4">
						<Card>
							<div className="d-flex align-items-center">
								<div className="flex-shrink-0">
									<ArrowUpRight
										size={32}
										className="text-success"
									/>
								</div>
								<div className="ms-3">
									<p className="small text-muted mb-1">
										This Month
									</p>
									<p className="h4 fw-bold mb-0">
										+{formatCurrency(3200)}
									</p>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>

			{/* Accounts Overview */}
			<div className="col-12">
				<Card>
					<h2 className="h5 fw-medium mb-4">Your Accounts</h2>
					<div className="row g-3">
						{accounts.map((account) => (
							<div key={account.id} className="col-12">
								<div className="border rounded p-3 hover-bg-light">
									<div className="d-flex align-items-center justify-content-between">
										<div className="d-flex align-items-center">
											<div className="flex-shrink-0">
												{getAccountIcon(account.type)}
											</div>
											<div className="ms-3">
												<p className="fw-medium mb-1">
													{account.name}
												</p>
												<p className="small text-muted mb-0">
													{account.number}
												</p>
											</div>
										</div>
										<div className="text-end">
											<p
												className={`h6 fw-semibold mb-0 ${
													account.balance >= 0
														? "text-dark"
														: "text-danger"
												}`}
											>
												{formatCurrency(
													account.balance
												)}
											</p>
											{account.type === "credit" && (
												<p className="small text-muted mb-0">
													Limit:{" "}
													{formatCurrency(
														account.limit
													)}
												</p>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</Card>
			</div>

			{/* Recent Transactions */}
			<div className="col-12">
				<Card>
					<div className="d-flex align-items-center justify-content-between mb-4">
						<h2 className="h5 fw-medium mb-0">
							Recent Transactions
						</h2>
						<button className="btn btn-link text-primary p-0 small">
							View all
						</button>
					</div>
					<div className="list-group list-group-flush">
						{recentTransactions.map((transaction, index) => (
							<div
								key={transaction.id}
								className={`list-group-item d-flex align-items-center justify-content-between py-3 ${
									index === recentTransactions.length - 1
										? "border-bottom-0"
										: ""
								}`}
							>
								<div className="d-flex align-items-center">
									<div className="flex-shrink-0">
										{transaction.type === "credit" ? (
											<ArrowUpRight
												size={20}
												className="text-success"
											/>
										) : (
											<ArrowDownRight
												size={20}
												className="text-danger"
											/>
										)}
									</div>
									<div className="ms-3">
										<p className="fw-medium mb-1">
											{transaction.description}
										</p>
										<p className="small text-muted mb-0">
											{transaction.date}
										</p>
									</div>
								</div>
								<div className="text-end">
									<p
										className={`small fw-semibold mb-0 ${
											transaction.amount >= 0
												? "text-success"
												: "text-danger"
										}`}
									>
										{transaction.amount >= 0 ? "+" : ""}
										{formatCurrency(transaction.amount)}
									</p>
								</div>
							</div>
						))}
					</div>
				</Card>
			</div>
		</div>
	);
};

export default Dashboard;
