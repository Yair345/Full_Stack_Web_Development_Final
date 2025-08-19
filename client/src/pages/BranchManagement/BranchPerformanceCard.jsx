import Card from "../../components/ui/Card";
import { formatNumber } from "./branchUtils";
import { useBranchPerformance } from "../../hooks/api/apiHooks";
import { useAuth } from "../../hooks";
import { useMemo } from "react";

const BranchPerformanceCard = () => {
	const { user } = useAuth();
	const branchId = user?.branch_id || 1; // Use user's branch or default to 1

	// Fetch performance data with 30-day period
	const {
		data: performanceResponse,
		loading: performanceLoading,
		error: performanceError,
		refetch: refetchPerformance,
	} = useBranchPerformance(branchId, { period: "30" });

	// Extract performance metrics from response
	const performanceMetrics = useMemo(() => {
		if (performanceResponse?.data) {
			return performanceResponse.data;
		}
		// Fallback to default values if data is not available
		return {
			satisfaction: 4.5,
			transactions: 0,
			newAccounts: 0,
			loanApplications: 0,
			revenueGrowth: 12,
		};
	}, [performanceResponse]);

	const performanceColor = "success"; // Static good performance indicator

	// Handle loading state
	if (performanceLoading) {
		return (
			<div className="col-lg-8">
				<Card>
					<h5 className="fw-medium mb-4">
						Branch Performance Overview
					</h5>
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

	// Handle error state
	if (performanceError && !performanceResponse) {
		return (
			<div className="col-lg-8">
				<Card>
					<h5 className="fw-medium mb-4">
						Branch Performance Overview
					</h5>
					<div className="alert alert-warning" role="alert">
						<div className="d-flex align-items-center">
							<div className="me-2">
								<svg
									width="20"
									height="20"
									fill="currentColor"
									className="bi bi-exclamation-triangle"
								>
									<path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
									<path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
								</svg>
							</div>
							<div className="flex-grow-1">
								<small>
									Unable to load performance data. Using
									default values.
								</small>
								<div className="mt-2">
									<button
										className="btn btn-sm btn-outline-warning"
										onClick={refetchPerformance}
									>
										Retry
									</button>
								</div>
							</div>
						</div>
					</div>
					{/* Still show the UI with default values */}
					<div className="row g-4">
						<div className="col-md-6">
							<div className="text-center">
								<div
									className={`bg-${performanceColor} rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3`}
									style={{ width: "80px", height: "80px" }}
								>
									<span className="h4 fw-bold text-white mb-0">
										{performanceMetrics.satisfaction.toFixed(
											1
										)}
									</span>
								</div>
								<h6 className="fw-medium">
									Customer Satisfaction
								</h6>
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
											performanceMetrics.transactions
										)}
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<span>New Accounts</span>
									<span className="fw-bold text-success">
										+{performanceMetrics.newAccounts}
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<span>Loan Applications</span>
									<span className="fw-bold text-warning">
										{performanceMetrics.loanApplications}
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
									<span>Revenue Growth</span>
									<span className="fw-bold text-success">
										+{performanceMetrics.revenueGrowth}%
									</span>
								</div>
							</div>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="col-lg-8">
			<Card>
				<h5 className="fw-medium mb-4">Branch Performance Overview</h5>
				<div className="row g-4">
					<div className="col-md-6">
						<div className="text-center">
							<div
								className={`bg-${performanceColor} rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3`}
								style={{ width: "80px", height: "80px" }}
							>
								<span className="h4 fw-bold text-white mb-0">
									{performanceMetrics.satisfaction.toFixed(1)}
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
										performanceMetrics.transactions
									)}
								</span>
							</div>
							<div className="list-group-item d-flex justify-content-between align-items-center px-0">
								<span>New Accounts</span>
								<span className="fw-bold text-success">
									+{performanceMetrics.newAccounts}
								</span>
							</div>
							<div className="list-group-item d-flex justify-content-between align-items-center px-0">
								<span>Loan Applications</span>
								<span className="fw-bold text-warning">
									{performanceMetrics.loanApplications}
								</span>
							</div>
							<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
								<span>Revenue Growth</span>
								<span className="fw-bold text-success">
									+{performanceMetrics.revenueGrowth}%
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
