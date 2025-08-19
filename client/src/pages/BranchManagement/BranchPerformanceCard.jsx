import Card from "../../components/ui/Card";
import { formatNumber, getBranchPerformanceColor } from "./branchUtils";

const BranchPerformanceCard = ({ branchStats }) => {
	// Safety check for branchStats and provide default values
	const safeStats = branchStats || {};
	const summary = safeStats.summary || {};
	const totals = summary.totals || {};
	const averages = summary.averages || {};

	const customerSatisfaction = averages.avgSatisfactionScore || 4.5;
	const performanceColor = getBranchPerformanceColor(customerSatisfaction);

	// Show loading state if no data
	if (!branchStats) {
		return (
			<div className="col-lg-8">
				<Card>
					<div className="d-flex justify-content-center py-5">
						<div
							className="spinner-border text-primary"
							role="status"
						>
							<span className="visually-hidden">
								Loading performance data...
							</span>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="col-lg-8">
			<Card>
				<h5 className="fw-medium mb-4">Branch Performance</h5>
				<div className="row g-4">
					<div className="col-md-6">
						<div className="text-center">
							<div
								className={`bg-${performanceColor} rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3`}
								style={{ width: "80px", height: "80px" }}
							>
								<span className="h4 fw-bold text-white mb-0">
									{customerSatisfaction.toFixed(1)}
								</span>
							</div>
							<h6 className="fw-medium">Customer Satisfaction</h6>
							<small className="text-muted">
								Average rating (out of 5)
							</small>
						</div>
					</div>
					<div className="col-md-6">
						<div className="list-group list-group-flush">
							<div className="list-group-item d-flex justify-content-between align-items-center px-0">
								<span>Monthly Transactions</span>
								<span className="fw-bold">
									{formatNumber(
										totals.totalTransactions || 0
									)}
								</span>
							</div>
							<div className="list-group-item d-flex justify-content-between align-items-center px-0">
								<span>New Accounts</span>
								<span className="fw-bold text-success">
									+{totals.newCustomers || 0}
								</span>
							</div>
							<div className="list-group-item d-flex justify-content-between align-items-center px-0">
								<span>Loan Applications</span>
								<span className="fw-bold text-warning">
									{totals.pendingLoans || 0}
								</span>
							</div>
							<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
								<span>Revenue Growth</span>
								<span className="fw-bold text-success">
									+12%
								</span>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default BranchPerformanceCard;
