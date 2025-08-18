import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency, getStatusBadge } from "./loanUtils";

const ApplicationsStatusTab = ({ applications }) => {
	const getStatusIcon = (status) => {
		switch (status) {
			case "approved":
				return <CheckCircle size={20} className="text-success" />;
			case "pending":
				return <Clock size={20} className="text-warning" />;
			case "rejected":
				return <AlertCircle size={20} className="text-danger" />;
			case "active":
				return <CheckCircle size={20} className="text-success" />;
			case "paid_off":
				return <CheckCircle size={20} className="text-success" />;
			case "defaulted":
				return <AlertCircle size={20} className="text-danger" />;
			default:
				return <Clock size={20} className="text-muted" />;
		}
	};

	if (!applications.length) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<div className="text-muted">
							<div className="mb-3">
								<i
									className="bi bi-file-text"
									style={{ fontSize: "3rem" }}
								></i>
							</div>
							<h5>No Applications</h5>
							<p>
								You haven't submitted any loan applications yet.
							</p>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="col-12">
			<h5 className="fw-medium mb-3">Your Applications</h5>

			<div className="row g-3">
				{applications.map((application) => (
					<div key={application.id} className="col-lg-6">
						<Card>
							<div className="d-flex justify-content-between align-items-start mb-3">
								<div className="d-flex align-items-center">
									<div className="me-3">
										{getStatusIcon(application.status)}
									</div>
									<div>
										<h6 className="fw-medium mb-1">
											{application.loan_type
												? (application.loan_type
													.charAt(0)
													.toUpperCase() +
													application.loan_type.slice(1))
												: 'Unknown'}{" "}
											Loan
										</h6>
										<small className="text-muted">
											Applied: {application.application_date ? 
												new Date(application.application_date).toLocaleDateString() : 
												'N/A'}
										</small>
									</div>
								</div>
								<span
									className={`badge ${
										getStatusBadge(application.status).class
									}`}
								>
									{getStatusBadge(application.status).text}
								</span>
							</div>

							<div className="row g-2 mb-3 small">
								<div className="col-6">
									<span className="text-muted">Amount:</span>
								</div>
								<div className="col-6 text-end">
									<span className="fw-bold">
										{formatCurrency(application.amount)}
									</span>
								</div>
								<div className="col-6">
									<span className="text-muted">Purpose:</span>
								</div>
								<div className="col-6 text-end">
									<span className="fw-medium">
										{application.purpose || 'N/A'}
									</span>
								</div>
								{application.interest_rate && (
									<>
										<div className="col-6">
											<span className="text-muted">
												Interest Rate:
											</span>
										</div>
										<div className="col-6 text-end">
											<span className="fw-medium text-info">
												{(application.interest_rate * 100).toFixed(2)}%
											</span>
										</div>
									</>
								)}
								{application.approval_date && (
									<>
										<div className="col-6">
											<span className="text-muted">
												Approval Date:
											</span>
										</div>
										<div className="col-6 text-end">
											<span className="fw-medium">
												{new Date(application.approval_date).toLocaleDateString()}
											</span>
										</div>
									</>
								)}
							</div>

							{application.status === "approved" && (
								<div className="alert alert-success">
									<small>
										<strong>Congratulations!</strong> Your
										loan has been approved. You'll receive
										the funds within 2-3 business days.
									</small>
								</div>
							)}

							{application.status === "pending" && (
								<div className="alert alert-info">
									<small>
										Your application is being reviewed.
										We'll notify you of the decision soon.
									</small>
								</div>
							)}

							{application.status === "rejected" && (
								<div className="alert alert-danger">
									<small>
										Unfortunately, your application was not approved.
										{application.rejection_reason && ` Reason: ${application.rejection_reason}`}
									</small>
								</div>
							)}

							{application.status === "active" && (
								<div className="alert alert-primary">
									<small>
										Your loan is active. Next payment due: {
											application.first_payment_date ? 
											new Date(application.first_payment_date).toLocaleDateString() : 
											'TBD'
										}
									</small>
								</div>
							)}
						</Card>
					</div>
				))}
			</div>
		</div>
	);
};

export default ApplicationsStatusTab;
