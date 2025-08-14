import Card from "../../components/ui/Card";
import { formatNumber, getBranchPerformanceColor } from "./branchUtils";

const BranchPerformanceCard = ({ branchStats }) => {
	const performanceColor = getBranchPerformanceColor(
		branchStats.customerSatisfaction
	);

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
									{branchStats.customerSatisfaction}
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
										branchStats.monthlyTransactions
									)}
								</span>
							</div>
							<div className="list-group-item d-flex justify-content-between align-items-center px-0">
								<span>New Accounts</span>
								<span className="fw-bold text-success">
									+{branchStats.newCustomersThisMonth}
								</span>
							</div>
							<div className="list-group-item d-flex justify-content-between align-items-center px-0">
								<span>Loan Applications</span>
								<span className="fw-bold text-warning">
									{branchStats.pendingApplications}
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
