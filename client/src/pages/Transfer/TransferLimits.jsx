import Card from "../../components/ui/Card";

const TransferLimits = () => {
	return (
		<div className="col-lg-4">
			<Card>
				<h6 className="fw-medium mb-3">Transfer Limits</h6>
				<div className="mb-3">
					<div className="d-flex justify-content-between small mb-1">
						<span>Daily Limit</span>
						<span>$2,500</span>
					</div>
					<div className="progress" style={{ height: "4px" }}>
						<div
							className="progress-bar"
							style={{ width: "30%" }}
						></div>
					</div>
					<small className="text-muted">$750 used today</small>
				</div>
				<div className="mb-3">
					<div className="d-flex justify-content-between small mb-1">
						<span>Monthly Limit</span>
						<span>$25,000</span>
					</div>
					<div className="progress" style={{ height: "4px" }}>
						<div
							className="progress-bar"
							style={{ width: "20%" }}
						></div>
					</div>
					<small className="text-muted">$5,200 used this month</small>
				</div>
			</Card>

			<Card>
				<h6 className="fw-medium mb-3">Security Notice</h6>
				<div className="alert alert-info p-3">
					<small>
						• Transfers between your accounts are instant
						<br />
						• External transfers may take 1-3 business days
						<br />
						• Wire transfers are typically processed same day
						<br />• Always verify recipient details before sending
					</small>
				</div>
			</Card>
		</div>
	);
};

export default TransferLimits;
