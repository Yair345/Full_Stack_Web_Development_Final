import Card from "../../components/ui/Card";
import { formatCurrency } from "./transferUtils";

const TransferLimits = ({ selectedAccount, currentAmount = 0 }) => {
	// Mock daily limits - in a real app, these would come from user settings/backend
	const dailyLimit = 2500;
	const monthlyLimit = 25000;
	const dailyUsed = 750; // This would come from today's transactions
	const monthlyUsed = 5200; // This would come from this month's transactions

	// Calculate remaining limits
	const dailyRemaining = dailyLimit - dailyUsed;
	const monthlyRemaining = monthlyLimit - monthlyUsed;

	// Calculate percentages
	const dailyPercentage = Math.min((dailyUsed / dailyLimit) * 100, 100);
	const monthlyPercentage = Math.min((monthlyUsed / monthlyLimit) * 100, 100);

	// Check if current amount would exceed limits
	const amountNum = parseFloat(currentAmount) || 0;
	const wouldExceedDaily = amountNum > dailyRemaining;
	const wouldExceedMonthly = amountNum > monthlyRemaining;
	const wouldExceedBalance =
		selectedAccount && amountNum > selectedAccount.balance;

	return (
		<div className="col-lg-4">
			<Card>
				<h6 className="fw-medium mb-3">
					Transfer Limits & Available Funds
				</h6>

				{/* Account Balance */}
				{selectedAccount && (
					<div className="mb-3">
						<div className="d-flex justify-content-between small mb-1">
							<span>Account Balance</span>
							<span className="fw-medium">
								{formatCurrency(selectedAccount.balance)}
							</span>
						</div>
						{amountNum > 0 && (
							<div className="d-flex justify-content-between small">
								<span
									className={
										wouldExceedBalance
											? "text-danger"
											: "text-muted"
									}
								>
									After Transfer:
								</span>
								<span
									className={
										wouldExceedBalance
											? "text-danger fw-medium"
											: "text-muted"
									}
								>
									{formatCurrency(
										selectedAccount.balance - amountNum
									)}
								</span>
							</div>
						)}
						{wouldExceedBalance && (
							<small className="text-danger">
								⚠️ Insufficient funds
							</small>
						)}
					</div>
				)}

				{/* Daily Limit */}
				<div className="mb-3">
					<div className="d-flex justify-content-between small mb-1">
						<span>Daily Limit</span>
						<span>{formatCurrency(dailyLimit)}</span>
					</div>
					<div className="progress mb-1" style={{ height: "6px" }}>
						<div
							className={`progress-bar ${
								dailyPercentage > 80
									? "bg-warning"
									: dailyPercentage > 95
									? "bg-danger"
									: ""
							}`}
							style={{ width: `${dailyPercentage}%` }}
						></div>
					</div>
					<div className="d-flex justify-content-between">
						<small className="text-muted">
							{formatCurrency(dailyUsed)} used today
						</small>
						<small
							className={
								wouldExceedDaily
									? "text-danger fw-medium"
									: "text-success"
							}
						>
							{formatCurrency(dailyRemaining)} remaining
						</small>
					</div>
					{wouldExceedDaily && amountNum > 0 && (
						<small className="text-danger">
							⚠️ Amount exceeds daily limit
						</small>
					)}
				</div>

				{/* Monthly Limit */}
				<div className="mb-3">
					<div className="d-flex justify-content-between small mb-1">
						<span>Monthly Limit</span>
						<span>{formatCurrency(monthlyLimit)}</span>
					</div>
					<div className="progress mb-1" style={{ height: "6px" }}>
						<div
							className={`progress-bar ${
								monthlyPercentage > 80
									? "bg-warning"
									: monthlyPercentage > 95
									? "bg-danger"
									: ""
							}`}
							style={{ width: `${monthlyPercentage}%` }}
						></div>
					</div>
					<div className="d-flex justify-content-between">
						<small className="text-muted">
							{formatCurrency(monthlyUsed)} used this month
						</small>
						<small
							className={
								wouldExceedMonthly
									? "text-danger fw-medium"
									: "text-success"
							}
						>
							{formatCurrency(monthlyRemaining)} remaining
						</small>
					</div>
					{wouldExceedMonthly && amountNum > 0 && (
						<small className="text-danger">
							⚠️ Amount exceeds monthly limit
						</small>
					)}
				</div>

				{/* Maximum Transferable Amount */}
				{selectedAccount && (
					<div className="alert alert-info p-2 mb-0">
						<small className="d-block fw-medium text-center">
							Max Transfer:{" "}
							{formatCurrency(
								Math.min(
									selectedAccount.balance,
									dailyRemaining,
									monthlyRemaining
								)
							)}
						</small>
						<small className="text-muted d-block text-center">
							Limited by:{" "}
							{selectedAccount.balance <= dailyRemaining &&
							selectedAccount.balance <= monthlyRemaining
								? "Account Balance"
								: dailyRemaining <= monthlyRemaining
								? "Daily Limit"
								: "Monthly Limit"}
						</small>
					</div>
				)}
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
