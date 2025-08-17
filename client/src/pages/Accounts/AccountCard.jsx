import { CreditCard, MoreVertical, Eye, FileText, Settings, DollarSign, TrendingUp, Calendar, Shield } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/helpers";

const AccountCard = ({ account }) => {
	const getAccountTypeBadge = (type) => {
		switch (type) {
			case "checking":
				return { class: "badge bg-primary", label: "Checking" };
			case "savings":
				return { class: "badge bg-success", label: "Savings" };
			case "credit":
				return { class: "badge bg-warning text-dark", label: "Credit" };
			default:
				return { class: "badge bg-secondary", label: "Account" };
		}
	};

	const getAccountIcon = (type) => {
		switch (type) {
			case "savings":
				return <TrendingUp size={32} className="text-success me-3" />;
			case "credit":
				return <CreditCard size={32} className="text-warning me-3" />;
			default:
				return <CreditCard size={32} className="text-primary me-3" />;
		}
	};

	const getStatusBadge = (status) => {
		return status === 'active' 
			? <span className="badge bg-success-subtle text-success">Active</span>
			: <span className="badge bg-danger-subtle text-danger">Inactive</span>;
	};

	const handleViewDetails = () => {
		// TODO: Navigate to account details page
		console.log("View details for account:", account.id);
	};

	const handleViewStatements = () => {
		// TODO: Navigate to statements page
		console.log("View statements for account:", account.id);
	};

	const handleAccountSettings = () => {
		// TODO: Open account settings modal
		console.log("Account settings for:", account.id);
	};

	const typeBadge = getAccountTypeBadge(account.type);
	const accountIcon = getAccountIcon(account.type);

	return (
		<div className="col-lg-6 col-xl-4">
			<Card className="h-100 position-relative overflow-hidden">
				{/* Account Header */}
				<div className="d-flex justify-content-between align-items-start mb-4">
					<div className="d-flex align-items-center">
						{accountIcon}
						<div>
							<h5 className="fw-semibold mb-1 text-truncate" style={{maxWidth: '200px'}}>
								{account.name || `${typeBadge.label} Account`}
							</h5>
							<p className="small text-muted mb-0 font-monospace">
								{account.number?.includes('*') ? account.number : `****-****-${account.number?.slice(-4) || '0000'}`}
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
							className="dropdown-menu dropdown-menu-end"
							aria-labelledby={`accountDropdown-${account.id}`}
						>
							<li>
								<button
									className="dropdown-item d-flex align-items-center"
									onClick={handleViewDetails}
								>
									<Eye size={16} className="me-2" />
									View Details
								</button>
							</li>
							<li>
								<button
									className="dropdown-item d-flex align-items-center"
									onClick={handleViewStatements}
								>
									<FileText size={16} className="me-2" />
									View Statements
								</button>
							</li>
							<li>
								<hr className="dropdown-divider" />
							</li>
							<li>
								<button 
									className="dropdown-item d-flex align-items-center"
									onClick={handleAccountSettings}
								>
									<Settings size={16} className="me-2" />
									Account Settings
								</button>
							</li>
						</ul>
					</div>
				</div>

				{/* Account Status */}
				<div className="d-flex justify-content-between align-items-center mb-3">
					<span className={typeBadge.class}>
						{typeBadge.label}
					</span>
					{getStatusBadge(account.status)}
				</div>

				{/* Balance Section */}
				<div className="mb-4">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<span className="text-muted d-flex align-items-center">
							<DollarSign size={16} className="me-1" />
							Current Balance
						</span>
						<span
							className={`h4 fw-bold mb-0 ${
								account.balance >= 0
									? "text-dark"
									: "text-danger"
							}`}
						>
							{formatCurrency(account.balance, account.currency)}
						</span>
					</div>

					{/* Available Balance for checking accounts with overdraft */}
					{account.type === "checking" && account.limit > 0 && (
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span className="small text-muted">
								Available Balance
							</span>
							<span className="small fw-medium text-success">
								{formatCurrency(account.balance + account.limit, account.currency)}
							</span>
						</div>
					)}

					{/* Overdraft Limit for checking accounts */}
					{account.type === "checking" && account.limit > 0 && (
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span className="small text-muted">
								Overdraft Limit
							</span>
							<span className="small fw-medium">
								{formatCurrency(account.limit, account.currency)}
							</span>
						</div>
					)}

					{/* Interest Rate for savings accounts */}
					{account.type === "savings" && account.interestRate && (
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span className="small text-muted d-flex align-items-center">
								<TrendingUp size={14} className="me-1" />
								Interest Rate
							</span>
							<span className="small fw-medium text-success">
								{account.interestRate.toFixed(2)}% APY
							</span>
						</div>
					)}

					{/* Credit Limit for credit accounts */}
					{account.type === "credit" && account.limit && (
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span className="small text-muted">
								Credit Limit
							</span>
							<span className="small fw-medium">
								{formatCurrency(account.limit, account.currency)}
							</span>
						</div>
					)}

					{/* Monthly Fee */}
					{account.monthlyFee > 0 && (
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span className="small text-muted">
								Monthly Fee
							</span>
							<span className="small fw-medium text-warning">
								{formatCurrency(account.monthlyFee, account.currency)}
							</span>
						</div>
					)}

					{/* Minimum Balance */}
					{account.minimumBalance > 0 && (
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span className="small text-muted">
								Minimum Balance
							</span>
							<span className="small fw-medium">
								{formatCurrency(account.minimumBalance, account.currency)}
							</span>
						</div>
					)}
				</div>

				{/* Account Details */}
				<div className="border-top pt-3 mb-4">
					<div className="row g-2 small">
						<div className="col-6">
							<div className="d-flex align-items-center text-muted mb-2">
								<Calendar size={14} className="me-2" />
								<span>Opened</span>
							</div>
							<div className="fw-medium">
								{new Date(account.openDate).toLocaleDateString()}
							</div>
						</div>
						<div className="col-6">
							<div className="d-flex align-items-center text-muted mb-2">
								<Shield size={14} className="me-2" />
								<span>Currency</span>
							</div>
							<div className="fw-medium">
								{account.currency || 'USD'}
							</div>
						</div>
						{/* Account ID */}
						<div className="col-12 mt-2">
							<div className="d-flex align-items-center text-muted mb-1">
								<span className="small">Account ID: </span>
							</div>
							<div className="fw-medium small font-monospace">
								#{account.id}
							</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="d-grid gap-2 d-md-flex mt-auto">
					<Button
						variant="primary"
						size="sm"
						className="flex-fill d-flex align-items-center justify-content-center"
						onClick={handleViewDetails}
					>
						<Eye size={16} className="me-1" />
						Details
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="flex-fill d-flex align-items-center justify-content-center"
						onClick={handleViewStatements}
					>
						<FileText size={16} className="me-1" />
						Statements
					</Button>
				</div>

				{/* Balance Indicator Bar */}
				{account.minimumBalance > 0 && (
					<div className="position-absolute bottom-0 start-0 w-100" style={{height: '4px'}}>
						<div 
							className={`h-100 ${
								account.balance >= account.minimumBalance 
									? 'bg-success' 
									: 'bg-warning'
							}`}
							style={{
								width: `${Math.min(100, Math.max(10, (account.balance / account.minimumBalance) * 100))}%`
							}}
						></div>
					</div>
				)}
			</Card>
		</div>
	);
};

export default AccountCard;
