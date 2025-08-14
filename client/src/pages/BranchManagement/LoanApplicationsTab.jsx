import { CheckCircle, XCircle, Eye } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
	formatCurrency,
	getStatusBadge,
	getPriorityBadge,
	getCreditScoreColor,
} from "./branchUtils";

const LoanApplicationCard = ({ application, onLoanAction }) => {
	const statusInfo = getStatusBadge(application.status);
	const priorityInfo = getPriorityBadge(application.priority);
	const creditScoreColor = getCreditScoreColor(application.creditScore);

	return (
		<div className="col-lg-6">
			<div className="border rounded p-4">
				<div className="d-flex justify-content-between align-items-start mb-3">
					<div>
						<h6 className="fw-medium mb-1">
							{application.customerName}
						</h6>
						<small className="text-muted">
							{application.email}
						</small>
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
							{application.loanType}
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Amount:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">
							{formatCurrency(application.requestedAmount)}
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Credit Score:</span>
					</div>
					<div className="col-6">
						<span className={`fw-medium text-${creditScoreColor}`}>
							{application.creditScore}
						</span>
					</div>
					<div className="col-6">
						<span className="text-muted">Income:</span>
					</div>
					<div className="col-6">
						<span className="fw-medium">
							{formatCurrency(application.monthlyIncome)}/mo
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
							{application.submittedDate}
						</span>
					</div>
				</div>

				<div className="d-flex gap-2">
					<Button
						variant="success"
						size="sm"
						onClick={() => onLoanAction("Approve", application.id)}
					>
						<CheckCircle size={14} className="me-1" />
						Approve
					</Button>
					<Button
						variant="danger"
						size="sm"
						onClick={() => onLoanAction("Reject", application.id)}
					>
						<XCircle size={14} className="me-1" />
						Reject
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onLoanAction("Review", application.id)}
					>
						<Eye size={14} className="me-1" />
						Review
					</Button>
				</div>
			</div>
		</div>
	);
};

const LoanApplicationsTab = ({
	loanApplications,
	onNewApplication,
	onLoanAction,
}) => {
	return (
		<div className="col-12">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h5 className="fw-medium mb-0">Loan Applications</h5>
					<div className="d-flex gap-2">
						<Button variant="outline">
							<span className="me-2">🔍</span>
							Filter
						</Button>
						<Button variant="primary" onClick={onNewApplication}>
							<span className="me-2">📝</span>
							New Application
						</Button>
					</div>
				</div>

				<div className="row g-4">
					{loanApplications.map((application) => (
						<LoanApplicationCard
							key={application.id}
							application={application}
							onLoanAction={onLoanAction}
						/>
					))}
				</div>

				{loanApplications.length === 0 && (
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
