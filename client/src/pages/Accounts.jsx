import { useState } from "react";
import { CreditCard, Plus, MoreVertical } from "lucide-react";

const Accounts = () => {
	const [accounts] = useState([
		{
			id: 1,
			name: "Main Checking Account",
			type: "checking",
			balance: 2500.75,
			number: "****1234",
			status: "active",
			openDate: "2023-01-15",
		},
		{
			id: 2,
			name: "High Yield Savings",
			type: "savings",
			balance: 15000.0,
			number: "****5678",
			status: "active",
			openDate: "2023-02-20",
			interestRate: 4.5,
		},
		{
			id: 3,
			name: "Premium Credit Card",
			type: "credit",
			balance: -1200.5,
			number: "****9012",
			status: "active",
			limit: 5000,
			apr: 18.99,
		},
	]);

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const getAccountTypeColor = (type) => {
		switch (type) {
			case "checking":
				return "bg-blue-100 text-blue-800";
			case "savings":
				return "bg-green-100 text-green-800";
			case "credit":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						My Accounts
					</h1>
					<p className="text-gray-600">
						Manage your bank accounts and view balances
					</p>
				</div>
				<button className="btn-primary flex items-center">
					<Plus className="h-5 w-5 mr-2" />
					Open New Account
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{accounts.map((account) => (
					<div
						key={account.id}
						className="card hover:shadow-lg transition-shadow"
					>
						<div className="flex justify-between items-start mb-4">
							<div className="flex items-center">
								<CreditCard className="h-8 w-8 text-blue-600 mr-3" />
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										{account.name}
									</h3>
									<p className="text-sm text-gray-500">
										{account.number}
									</p>
								</div>
							</div>
							<button className="p-2 hover:bg-gray-100 rounded-lg">
								<MoreVertical className="h-5 w-5 text-gray-400" />
							</button>
						</div>

						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-500">
									Balance
								</span>
								<span
									className={`text-xl font-bold ${
										account.balance >= 0
											? "text-gray-900"
											: "text-red-600"
									}`}
								>
									{formatCurrency(account.balance)}
								</span>
							</div>

							{account.type === "credit" && (
								<>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-500">
											Credit Limit
										</span>
										<span className="text-sm font-medium text-gray-900">
											{formatCurrency(account.limit)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-500">
											APR
										</span>
										<span className="text-sm font-medium text-gray-900">
											{account.apr}%
										</span>
									</div>
								</>
							)}

							{account.type === "savings" && (
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-500">
										Interest Rate
									</span>
									<span className="text-sm font-medium text-bank-green-600">
										{account.interestRate}% APY
									</span>
								</div>
							)}

							<div className="flex justify-between items-center pt-2 border-t border-gray-200">
								<span
									className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getAccountTypeColor(
										account.type
									)}`}
								>
									{account.type}
								</span>
								<span className="text-sm text-gray-500">
									Opened{" "}
									{new Date(
										account.openDate
									).toLocaleDateString()}
								</span>
							</div>
						</div>

						<div className="mt-4 flex space-x-3">
							<button className="flex-1 btn-primary text-sm">
								View Details
							</button>
							<button className="flex-1 btn-secondary text-sm">
								Statements
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Accounts;
