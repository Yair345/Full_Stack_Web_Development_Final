import { useState } from "react";
import { CheckCircle, XCircle, Search, Filter } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
	formatCurrency,
	getStatusBadge,
	getPriorityBadge,
	getCreditScoreColor,
	filterLoanApplications,
} from "./branchUtils";

const LoanApplicationCard = ({ application, onLoanAction }) => {
	const statusInfo = getStatusBadge(application.status);
	const priorityInfo = getPriorityBadge(application.priority || "medium");
	const creditScoreColor = getCreditScoreColor(
		application.creditScore || application.credit_score
	);

	// Handle different data structures - API vs Demo data
	const customerName =
		application.customerName ||
		(application.borrower
			? `${application.borrower.first_name} ${application.borrower.last_name}`
			: "Unknown Customer");
	const email =
		application.email || application.borrower?.email || "No email";

	const isPending =
		application.status === "pending" ||
		application.status === "pending_review";
	const isApproved = application.status === "approved";
	const isRejected = application.status === "rejected";

	return (
		<div className="col-lg-6">
			<div className="border rounded p-4">
				<div className="d-flex justify-content-between align-items-start mb-3">
					<div>
						<h6 className="fw-medium mb-1">{customerName}</h6>
						<small className="text-muted">{email}</small>
					</div>
					<div className="d-flex gap-2">
						<span className={`badge ${priorityInfo.class}`}>
							{priorityInfo.text}
						</span>
						<span className={`badge ${statusInfo.class}`}>
							{statusInfo.text}
						</span>
					</div>
				</div>

				<div className="row g-2 mb-3 small">
					<div className="col-6">
						<span className="text-muted">Loan Type:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">
							{application.loanType ||
								application.loan_type ||
								"N/A"}
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Amount:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">
							{formatCurrency(
								application.requestedAmount ||
									application.amount ||
									0
							)}
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Credit Score:</span>
					</div>
					<div className="col-6">
						<span className={`fw-medium text-${creditScoreColor}`}>
							{application.creditScore ||
								application.credit_score ||
								"N/A"}
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Income:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">
							{formatCurrency(
								application.monthlyIncome ||
									application.annual_income / 12
							)}
							/mo
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Monthly Payment:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">
							{formatCurrency(
								application.monthlyPayment ||
									application.monthly_payment_calculated ||
									application.monthly_payment ||
									0
							)}
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Interest Rate:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">
							{application.interest_rate
								? (
										parseFloat(application.interest_rate) *
										100
								  ).toFixed(2)
								: "0.00"}
							%
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Purpose:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">{application.purpose}</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Submitted:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">
							{application.submittedDate
								? new Date(
										application.submittedDate
								  ).toLocaleDateString()
								: application.application_date
								? new Date(
										application.application_date
								  ).toLocaleDateString()
								: "N/A"}
						</span>
					</div>
					{isRejected && application.rejection_reason && (
						<>
							<div className="col-12">
								<hr className="my-2" />
							</div>
							<div className="col-12">
								<span className="text-muted">
									Rejection Reason:
								</span>
								<div className="mt-1 p-2 bg-light rounded">
									<small className="text-danger">
										{application.rejection_reason}
									</small>
								</div>
							</div>
						</>
					)}
				</div>

				<div className="d-flex gap-2">
					{isPending && (
						<>
							<Button
								variant="success"
								size="sm"
								onClick={() =>
									onLoanAction("Approve", application.id)
								}
							>
								<CheckCircle size={14} className="me-1" />
								Approve
							</Button>
							<Button
								variant="danger"
								size="sm"
								onClick={() =>
									onLoanAction("Reject", application.id)
								}
							>
								<XCircle size={14} className="me-1" />
								Reject
							</Button>
						</>
					)}
					{isApproved && (
						<span className="badge bg-success py-2 px-3">
							<CheckCircle size={14} className="me-1" />
							Approved
						</span>
					)}
					{isRejected && (
						<span className="badge bg-danger py-2 px-3">
							<XCircle size={14} className="me-1" />
							Rejected
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

const LoanApplicationsTab = ({
	loanApplications,
	loading,
	error,
	onLoanAction,
	onRefresh,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");

	console.log("LoanApplicationsTab - loanApplications:", loanApplications); // Debug log

	const filteredApplications = filterLoanApplications(
		loanApplications,
		searchTerm,
		statusFilter,
		typeFilter
	);

	const handleClearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
		setTypeFilter("all");
	};

	const hasActiveFilters =
		searchTerm || statusFilter !== "all" || typeFilter !== "all";

	if (loading) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-4">
						<div className="spinner-border" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<p className="text-muted mt-2">
							Loading loan applications...
						</p>
					</div>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-4">
						<span style={{ fontSize: "3rem" }}>⚠️</span>
						<p className="text-muted mt-2">
							Error loading loan applications
						</p>
						<p className="small text-muted">
							{error.message || "Unknown error"}
						</p>
						<Button variant="primary" onClick={onRefresh}>
							Try Again
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<div>
						<h5 className="fw-medium mb-0">Loan Applications</h5>
						{hasActiveFilters && (
							<small className="text-muted">
								Showing {filteredApplications.length} of{" "}
								{loanApplications?.length || 0} applications
							</small>
						)}
					</div>
					<div className="d-flex gap-2">
						{onRefresh && (
							<Button variant="outline" onClick={onRefresh}>
								<span className="me-2">🔄</span>
								Refresh
							</Button>
						)}
						{hasActiveFilters && (
							<Button
								variant="outline"
								size="sm"
								onClick={handleClearFilters}
							>
								Clear Filters
							</Button>
						)}
					</div>
				</div>

				{/* Search and Filter Controls */}
				<div className="row g-3 mb-4">
					<div className="col-md-6">
						<div className="input-group">
							<span className="input-group-text">
								<Search size={16} />
							</span>
							<Input
								placeholder="Search by customer, email, type, or purpose..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<div className="col-md-3">
						<select
							className="form-select"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">All Applications</option>
							<option value="pending">Pending Review</option>
							<option value="approved">Approved/Active</option>
							<option value="rejected">Rejected</option>
						</select>
					</div>
					<div className="col-md-3">
						<select
							className="form-select"
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
						>
							<option value="all">All Types</option>
							<option value="personal loan">Personal Loan</option>
							<option value="auto loan">Auto Loan</option>
							<option value="mortgage">Mortgage</option>
							<option value="business loan">Business Loan</option>
						</select>
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="text-center py-4">
						<div className="spinner-border" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<p className="text-muted mt-2">
							Loading loan applications...
						</p>
					</div>
				)}

				{/* Error State */}
				{error && !loading && (
					<div className="text-center py-4">
						<span style={{ fontSize: "3rem" }}>⚠️</span>
						<p className="text-muted mt-2">
							Error loading loan applications
						</p>
						<p className="small text-muted">
							{error.message || "Unknown error"}
						</p>
						<Button variant="primary" onClick={onRefresh}>
							Try Again
						</Button>
					</div>
				)}

				{/* Applications Grid */}
				{!loading && !error && (
					<div className="row g-4">
						{filteredApplications.map((application) => (
							<LoanApplicationCard
								key={application.id}
								application={application}
								onLoanAction={onLoanAction}
							/>
						))}
					</div>
				)}

				{/* No Results Message */}
				{!loading &&
					!error &&
					filteredApplications.length === 0 &&
					loanApplications.length > 0 && (
						<div className="text-center py-4">
							<span style={{ fontSize: "3rem" }}>🔍</span>
							<p className="text-muted mt-2">
								No applications found matching your filters
							</p>
							<Button
								variant="outline"
								onClick={handleClearFilters}
							>
								Clear Filters
							</Button>
						</div>
					)}

				{/* No Applications Message */}
				{!loading && !error && loanApplications.length === 0 && (
					<div className="text-center py-4">
						<span style={{ fontSize: "3rem" }}>📄</span>
						<p className="text-muted mt-2">
							No loan applications found
						</p>
						<p className="small text-muted">
							New loan applications will appear here for review
						</p>
					</div>
				)}
			</Card>
		</div>
	);
};

export default LoanApplicationsTab;
