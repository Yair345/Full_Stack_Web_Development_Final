import { CreditCard, MoreVertical } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/helpers";

const AccountCard = ({ account }) => {
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

	const handleViewDetails = () => {
		// TODO: Navigate to account details page
		console.log("View details for account:", account.id);
	};

	const handleViewStatements = () => {
		// TODO: Navigate to statements page
		console.log("View statements for account:", account.id);
	};

	return (
		<div className="col-lg-6">
			<Card className="h-100 hover-bg-light">
				<div className="d-flex justify-content-between align-items-start mb-4">
					<div className="d-flex align-items-center">
						<CreditCard size={32} className="text-primary me-3" />
						<div>
							<h5 className="fw-semibold mb-1">{account.name}</h5>
							<p className="small text-muted mb-0">
								{account.number}
							</p>
						</div>
					</div>
					<div className="dropdown">
						<button
							className="btn btn-sm btn-outline-secondary dropdown-toggle"
							type="button"
							id={`accountDropdown-${account.id}`}
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							<MoreVertical size={16} />
						</button>
						<ul
							className="dropdown-menu"
							aria-labelledby={`accountDropdown-${account.id}`}
						>
							<li>
								<button
									className="dropdown-item"
									onClick={handleViewDetails}
								>
									View Details
								</button>
							</li>
							<li>
								<button
									className="dropdown-item"
									onClick={handleViewStatements}
								>
									View Statements
								</button>
							</li>
							<li>
								<hr className="dropdown-divider" />
							</li>
							<li>
								<button className="dropdown-item text-muted">
									Account Settings
								</button>
							</li>
						</ul>
					</div>
				</div>

				<div className="mb-4">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<span className="text-muted">Balance</span>
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
									{formatCurrency(account.limit)}
								</span>
							</div>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<span className="small text-muted">APR</span>
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
						<span className={getAccountTypeBadge(account.type)}>
							{account.type}
						</span>
						<span className="small text-muted">
							Opened{" "}
							{new Date(account.openDate).toLocaleDateString()}
						</span>
					</div>
				</div>

				<div className="d-grid gap-2 d-md-flex">
					<Button
						variant="primary"
						size="sm"
						className="flex-fill"
						onClick={handleViewDetails}
					>
						View Details
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="flex-fill"
						onClick={handleViewStatements}
					>
						Statements
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default AccountCard;
