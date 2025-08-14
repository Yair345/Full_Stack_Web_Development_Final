import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import Card from "../../components/ui/Card";

const CardsSummary = ({ cards }) => {
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const totalCreditLimit = cards
		.filter((card) => card.accountType === "Credit")
		.reduce((sum, card) => sum + card.creditLimit, 0);

	const totalCreditUsed = cards
		.filter((card) => card.accountType === "Credit")
		.reduce((sum, card) => sum + card.balance, 0);

	const totalDebitBalance = cards
		.filter((card) => card.accountType === "Debit")
		.reduce((sum, card) => sum + card.availableBalance, 0);

	const creditUtilization =
		totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;

	return (
		<div className="col-lg-6">
			<Card>
				<h5 className="fw-medium mb-4">Cards Summary</h5>

				<div className="row g-3">
					<div className="col-12">
						<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
							<div className="d-flex align-items-center">
								<TrendingUp
									size={20}
									className="text-success me-2"
								/>
								<div>
									<div className="fw-medium">
										Total Credit Limit
									</div>
									<small className="text-muted">
										Available credit across all cards
									</small>
								</div>
							</div>
							<div className="text-end">
								<div className="fw-bold text-success">
									{formatCurrency(totalCreditLimit)}
								</div>
							</div>
						</div>
					</div>

					<div className="col-12">
						<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
							<div className="d-flex align-items-center">
								<TrendingDown
									size={20}
									className="text-danger me-2"
								/>
								<div>
									<div className="fw-medium">Credit Used</div>
									<small className="text-muted">
										Total outstanding balance
									</small>
								</div>
							</div>
							<div className="text-end">
								<div className="fw-bold text-danger">
									{formatCurrency(totalCreditUsed)}
								</div>
							</div>
						</div>
					</div>

					<div className="col-12">
						<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
							<div className="d-flex align-items-center">
								<Activity
									size={20}
									className="text-primary me-2"
								/>
								<div>
									<div className="fw-medium">
										Debit Balance
									</div>
									<small className="text-muted">
										Total available in debit accounts
									</small>
								</div>
							</div>
							<div className="text-end">
								<div className="fw-bold text-primary">
									{formatCurrency(totalDebitBalance)}
								</div>
							</div>
						</div>
					</div>

					<div className="col-12">
						<div className="border-top pt-3">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<span className="text-muted small">
									Credit Utilization
								</span>
								<span className="fw-medium">
									{creditUtilization.toFixed(1)}%
								</span>
							</div>
							<div className="progress" style={{ height: "8px" }}>
								<div
									className={`progress-bar ${
										creditUtilization > 70
											? "bg-danger"
											: creditUtilization > 30
											? "bg-warning"
											: "bg-success"
									}`}
									style={{
										width: `${Math.min(
											creditUtilization,
											100
										)}%`,
									}}
								></div>
							</div>
							<small
								className={`text-${
									creditUtilization > 70
										? "danger"
										: creditUtilization > 30
										? "warning"
										: "success"
								}`}
							>
								{creditUtilization > 70
									? "High utilization - consider paying down balances"
									: creditUtilization > 30
									? "Moderate utilization"
									: "Good utilization ratio"}
							</small>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default CardsSummary;
