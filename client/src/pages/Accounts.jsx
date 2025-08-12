import { useState } from "react";
import { CreditCard, Plus, MoreVertical } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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

	const getAccountTypeBadge = (type) => {
		switch (type) {
			case "checking":
				return "badge bg-primary";
			case "savings":
				return "badge bg-success";
			case "credit":
				return "badge bg-warning";
			default:
				return "badge bg-secondary";
		}
	};

	return (
		<div className="row g-4">
			<div className="col-12">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						<h1 className="h2 fw-bold text-dark mb-1">
							My Accounts
						</h1>
						<p className="text-muted mb-0">
							Manage your bank accounts and view balances
						</p>
					</div>
					<Button
						variant="primary"
						className="d-flex align-items-center"
					>
						<Plus size={20} className="me-2" />
						Open New Account
					</Button>
				</div>
			</div>

			<div className="col-12">
				<div className="row g-4">
					{accounts.map((account) => (
						<div key={account.id} className="col-lg-6">
							<Card className="h-100 hover-bg-light">
								<div className="d-flex justify-content-between align-items-start mb-4">
									<div className="d-flex align-items-center">
										<CreditCard
											size={32}
											className="text-primary me-3"
										/>
										<div>
											<h5 className="fw-semibold mb-1">
												{account.name}
											</h5>
											<p className="small text-muted mb-0">
												{account.number}
											</p>
										</div>
									</div>
									<div className="dropdown">
										<button
											className="btn btn-sm btn-outline-secondary"
											type="button"
											data-bs-toggle="dropdown"
										>
											<MoreVertical size={16} />
										</button>
									</div>
								</div>

								<div className="mb-4">
									<div className="d-flex justify-content-between align-items-center mb-3">
										<span className="text-muted">
											Balance
										</span>
										<span
											className={`h4 fw-bold mb-0 ${
												account.balance >= 0
													? "text-dark"
													: "text-danger"
											}`}
										>
											{formatCurrency(account.balance)}
										</span>
									</div>

									{account.type === "credit" && (
										<>
											<div className="d-flex justify-content-between align-items-center mb-2">
												<span className="small text-muted">
													Credit Limit
												</span>
												<span className="small fw-medium">
													{formatCurrency(
														account.limit
													)}
												</span>
											</div>
											<div className="d-flex justify-content-between align-items-center mb-2">
												<span className="small text-muted">
													APR
												</span>
												<span className="small fw-medium">
													{account.apr}%
												</span>
											</div>
										</>
									)}

									{account.type === "savings" && (
										<div className="d-flex justify-content-between align-items-center mb-2">
											<span className="small text-muted">
												Interest Rate
											</span>
											<span className="small fw-medium text-success">
												{account.interestRate}% APY
											</span>
										</div>
									)}

									<div className="d-flex justify-content-between align-items-center pt-3 border-top">
										<span
											className={getAccountTypeBadge(
												account.type
											)}
										>
											{account.type}
										</span>
										<span className="small text-muted">
											Opened{" "}
											{new Date(
												account.openDate
											).toLocaleDateString()}
										</span>
									</div>
								</div>

								<div className="d-grid gap-2 d-md-flex">
									<Button
										variant="primary"
										size="sm"
										className="flex-fill"
									>
										View Details
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-fill"
									>
										Statements
									</Button>
								</div>
							</Card>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Accounts;
