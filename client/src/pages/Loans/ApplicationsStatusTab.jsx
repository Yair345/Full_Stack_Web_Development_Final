import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency, getStatusBadge } from "./loanUtils";

const ApplicationsStatusTab = ({ applications }) => {
	const getStatusIcon = (status) => {
		switch (status) {
			case "approved":
				return <CheckCircle size={20} className="text-success" />;
			case "under_review":
				return <Clock size={20} className="text-warning" />;
			case "denied":
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
											{application.type
												.charAt(0)
												.toUpperCase() +
												application.type.slice(1)}{" "}
											Loan
										</h6>
										<small className="text-muted">
											Applied: {application.submittedDate}
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
										{application.purpose}
									</span>
								</div>
								{application.rate && (
									<>
										<div className="col-6">
											<span className="text-muted">
												Approved Rate:
											</span>
										</div>
										<div className="col-6 text-end">
											<span className="fw-medium text-success">
												{application.rate}%
											</span>
										</div>
									</>
								)}
								{application.expectedDecision && (
									<>
										<div className="col-6">
											<span className="text-muted">
												Expected Decision:
											</span>
										</div>
										<div className="col-6 text-end">
											<span className="fw-medium">
												{application.expectedDecision}
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

							{application.status === "under_review" && (
								<div className="alert alert-info">
									<small>
										Your application is being reviewed.
										We'll notify you of the decision soon.
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
