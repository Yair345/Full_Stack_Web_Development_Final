import { useSelector } from "react-redux";
import {
	CreditCard,
	TrendingUp,
	ArrowUpRight,
	ArrowDownRight,
	DollarSign,
} from "lucide-react";

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
				return <CreditCard className="h-6 w-6 text-blue-600" />;
			case "savings":
				return <TrendingUp className="h-6 w-6 text-green-600" />;
			case "credit":
				return <DollarSign className="h-6 w-6 text-orange-600" />;
			default:
				return <CreditCard className="h-6 w-6 text-gray-600" />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
				<h1 className="text-2xl font-bold mb-2">
					Welcome back, {user?.firstName}!
				</h1>
				<p className="text-blue-100">
					Here's an overview of your accounts and recent activity.
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="card">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<TrendingUp className="h-8 w-8 text-green-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">
								Total Balance
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{formatCurrency(
									accounts.reduce(
										(sum, acc) => sum + acc.balance,
										0
									)
								)}
							</p>
						</div>
					</div>
				</div>

				<div className="card">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<CreditCard className="h-8 w-8 text-blue-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">
								Active Accounts
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{accounts.length}
							</p>
						</div>
					</div>
				</div>

				<div className="card">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<ArrowUpRight className="h-8 w-8 text-green-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">
								This Month
							</p>
							<p className="text-2xl font-bold text-gray-900">
								+{formatCurrency(3200)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Accounts Overview */}
			<div className="card">
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					Your Accounts
				</h2>
				<div className="space-y-4">
					{accounts.map((account) => (
						<div
							key={account.id}
							className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<div className="flex items-center">
								<div className="flex-shrink-0">
									{getAccountIcon(account.type)}
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-900">
										{account.name}
									</p>
									<p className="text-sm text-gray-500">
										{account.number}
									</p>
								</div>
							</div>
							<div className="text-right">
								<p
									className={`text-lg font-semibold ${
										account.balance >= 0
											? "text-gray-900"
											: "text-red-600"
									}`}
								>
									{formatCurrency(account.balance)}
								</p>
								{account.type === "credit" && (
									<p className="text-sm text-gray-500">
										Limit: {formatCurrency(account.limit)}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Recent Transactions */}
			<div className="card">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium text-gray-900">
						Recent Transactions
					</h2>
					<button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
						View all
					</button>
				</div>
				<div className="space-y-3">
					{recentTransactions.map((transaction) => (
						<div
							key={transaction.id}
							className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
						>
							<div className="flex items-center">
								<div className="flex-shrink-0">
									{transaction.type === "credit" ? (
										<ArrowUpRight className="h-5 w-5 text-green-600" />
									) : (
										<ArrowDownRight className="h-5 w-5 text-red-600" />
									)}
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-gray-900">
										{transaction.description}
									</p>
									<p className="text-sm text-gray-500">
										{transaction.date}
									</p>
								</div>
							</div>
							<div className="text-right">
								<p
									className={`text-sm font-semibold ${
										transaction.amount >= 0
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									{transaction.amount >= 0 ? "+" : ""}
									{formatCurrency(transaction.amount)}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
