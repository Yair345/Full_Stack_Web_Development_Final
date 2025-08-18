import { TrendingUp, TrendingDown, Activity, CreditCard } from "lucide-react";
import Card from "../../components/ui/Card";

const CardsSummary = ({ cards }) => {
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount || 0);
	};

	const creditCards = cards.filter((card) => card.card_type === "credit");
	const debitCards = cards.filter((card) => card.card_type === "debit");
	const activeCards = cards.filter((card) => card.status === "active");
	const blockedCards = cards.filter((card) => card.status === "blocked");

	const totalCreditLimit = creditCards.reduce(
		(sum, card) => sum + (card.monthly_limit || 0),
		0
	);
	const totalDebitBalance = debitCards.reduce(
		(sum, card) => sum + (card.balance || 0),
		0
	);

	// For credit cards, we don't have current balance from the API, so we'll show limits
	const totalDailyLimits = cards.reduce(
		(sum, card) => sum + (card.daily_limit || 0),
		0
	);
	const totalMonthlyLimits = cards.reduce(
		(sum, card) => sum + (card.monthly_limit || 0),
		0
	);

	return (
		<div className="col-lg-6">
			<Card>
				<h5 className="fw-medium mb-4">Cards Summary</h5>

				<div className="row g-3">
					{/* Cards Count */}
					<div className="col-12">
						<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
							<div className="d-flex align-items-center">
								<CreditCard
									size={20}
									className="text-primary me-2"
								/>
								<div>
									<div className="fw-medium">Total Cards</div>
									<small className="text-muted">
										{activeCards.length} active,{" "}
										{blockedCards.length} blocked
									</small>
								</div>
							</div>
							<div className="text-end">
								<div className="fw-bold text-primary">
									{cards.length}
								</div>
							</div>
						</div>
					</div>

					{/* Credit Cards Summary */}
					{creditCards.length > 0 && (
						<div className="col-12">
							<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
								<div className="d-flex align-items-center">
									<TrendingUp
										size={20}
										className="text-info me-2"
									/>
									<div>
										<div className="fw-medium">
											Credit Cards Monthly Limit
										</div>
										<small className="text-muted">
											{creditCards.length} credit card
											{creditCards.length !== 1
												? "s"
												: ""}
										</small>
									</div>
								</div>
								<div className="text-end">
									<div className="fw-bold text-info">
										{formatCurrency(totalCreditLimit)}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Debit Cards Balance */}
					{debitCards.length > 0 && (
						<div className="col-12">
							<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
								<div className="d-flex align-items-center">
									<Activity
										size={20}
										className="text-success me-2"
									/>
									<div>
										<div className="fw-medium">
											Debit Account Balance
										</div>
										<small className="text-muted">
											{debitCards.length} debit card
											{debitCards.length !== 1 ? "s" : ""}
										</small>
									</div>
								</div>
								<div className="text-end">
									<div className="fw-bold text-success">
										{formatCurrency(totalDebitBalance)}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Spending Limits Summary */}
					<div className="col-12">
						<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
							<div className="d-flex align-items-center">
								<TrendingDown
									size={20}
									className="text-warning me-2"
								/>
								<div>
									<div className="fw-medium">
										Daily Limits
									</div>
									<small className="text-muted">
										Total daily spending limits
									</small>
								</div>
							</div>
							<div className="text-end">
								<div className="fw-bold text-warning">
									{formatCurrency(totalDailyLimits)}
								</div>
							</div>
						</div>
					</div>

					{/* Card Types Breakdown */}
					{cards.length > 0 && (
						<div className="col-12">
							<div className="border-top pt-3">
								<div className="d-flex justify-content-between align-items-center mb-2">
									<span className="text-muted small">
										Card Types
									</span>
								</div>
								<div className="row g-2">
									<div className="col-6">
										<div className="text-center p-2 bg-light rounded">
											<div className="fw-bold text-primary">
												{creditCards.length}
											</div>
											<small className="text-muted">
												Credit
											</small>
										</div>
									</div>
									<div className="col-6">
										<div className="text-center p-2 bg-light rounded">
											<div className="fw-bold text-success">
												{debitCards.length}
											</div>
											<small className="text-muted">
												Debit
											</small>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* No Cards Message */}
					{cards.length === 0 && (
						<div className="col-12">
							<div className="text-center py-4">
								<CreditCard
									size={48}
									className="text-muted mb-3"
								/>
								<h6 className="text-muted">No Cards Found</h6>
								<p className="text-muted small mb-0">
									Request your first card to see summary
									information
								</p>
							</div>
						</div>
					)}
				</div>
			</Card>
		</div>
	);
};

export default CardsSummary;
