import {
	TrendingUp,
	TrendingDown,
	Target,
	DollarSign,
	PiggyBank,
} from "lucide-react";
import Card from "../../components/ui/Card";
import {
	formatCurrency,
	calculateMonthlyIncome,
	calculateMonthlySpending,
	getSavingsProgress,
} from "./dashboardUtils";

const FinancialInsights = ({
	transactions = [],
	accounts = [],
	savingsGoal = 20000,
}) => {
	// Calculate financial metrics with fallbacks
	const monthlyIncome = calculateMonthlyIncome(transactions);
	const monthlySpending = calculateMonthlySpending(transactions);

	// Find savings accounts and calculate total savings
	const savingsAccounts = accounts.filter(
		(acc) => acc.type === "savings" || acc.account_type === "savings"
	);
	const currentSavings = savingsAccounts.reduce((total, acc) => {
		return total + parseFloat(acc.balance || 0);
	}, 0);

	const savingsProgress = getSavingsProgress(currentSavings, savingsGoal);
	const netCashFlow = monthlyIncome - monthlySpending;

	// Calculate previous month for trend (mock data for now)
	const getPreviousMonthTrend = (currentValue, type) => {
		// In a real app, this would compare with actual previous month data
		// For now, we'll simulate some trends based on the data
		if (type === "income") {
			return currentValue > 2000 ? "+12%" : "+5%";
		} else if (type === "spending") {
			return currentValue > 1000 ? "-5%" : "+3%";
		}
		return "0%";
	};

	const insights = [
		{
			id: 1,
			title: "Monthly Income",
			value: formatCurrency(monthlyIncome),
			icon: TrendingUp,
			color: monthlyIncome > 0 ? "success" : "muted",
			trend:
				monthlyIncome > 0
					? `${getPreviousMonthTrend(
							monthlyIncome,
							"income"
					  )} from last month`
					: "No income this month",
		},
		{
			id: 2,
			title: "Monthly Spending",
			value: formatCurrency(monthlySpending),
			icon: TrendingDown,
			color: monthlySpending > 0 ? "danger" : "muted",
			trend:
				monthlySpending > 0
					? `${getPreviousMonthTrend(
							monthlySpending,
							"spending"
					  )} from last month`
					: "No spending this month",
		},
		{
			id: 3,
			title: "Net Cash Flow",
			value: formatCurrency(netCashFlow),
			icon: DollarSign,
			color: netCashFlow >= 0 ? "success" : "danger",
			trend:
				netCashFlow >= 0
					? "Positive cash flow"
					: "Spending exceeds income",
		},
		{
			id: 4,
			title: "Total Savings",
			value: formatCurrency(currentSavings),
			icon: PiggyBank,
			color: currentSavings > 0 ? "success" : "muted",
			trend:
				savingsAccounts.length > 0
					? `${savingsAccounts.length} savings account${
							savingsAccounts.length > 1 ? "s" : ""
					  }`
					: "No savings accounts",
		},
	];

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex align-items-center justify-content-between mb-4">
					<h2 className="h5 fw-medium mb-0">Financial Insights</h2>
					<span className="badge bg-light text-dark">This Month</span>
				</div>

				<div className="row g-3">
					{insights.map((insight) => {
						const IconComponent = insight.icon;
						return (
							<div key={insight.id} className="col-md-6 col-lg-3">
								<div className="d-flex align-items-center p-3 border rounded bg-white hover-shadow transition-shadow">
									<div className="flex-shrink-0">
										<IconComponent
											size={24}
											className={`text-${insight.color}`}
										/>
									</div>
									<div className="ms-3 flex-grow-1">
										<p className="small text-muted mb-1">
											{insight.title}
										</p>
										<p className="h6 fw-bold mb-0">
											{insight.value}
										</p>
										<p
											className={`small mb-0 text-${insight.color}`}
										>
											{insight.trend}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Savings Goal Progress Section */}
				{savingsGoal > 0 && (
					<div className="mt-4">
						<div className="row">
							<div className="col-md-8">
								<div className="p-3 bg-light rounded">
									<div className="d-flex justify-content-between align-items-center mb-2">
										<span className="small text-muted d-flex align-items-center">
											<Target
												size={16}
												className="me-1"
											/>
											Savings Goal Progress
										</span>
										<span className="small fw-medium">
											{savingsProgress}%
										</span>
									</div>
									<div
										className="progress"
										style={{ height: "10px" }}
									>
										<div
											className={`progress-bar bg-${
												savingsProgress >= 75
													? "success"
													: savingsProgress >= 50
													? "warning"
													: savingsProgress >= 25
													? "info"
													: "danger"
											}`}
											role="progressbar"
											style={{
												width: `${Math.min(
													100,
													Math.max(0, savingsProgress)
												)}%`,
											}}
											aria-valuenow={savingsProgress}
											aria-valuemin="0"
											aria-valuemax="100"
										></div>
									</div>
									<div className="d-flex justify-content-between mt-2">
										<span className="small text-muted">
											{formatCurrency(currentSavings)}{" "}
											saved
										</span>
										<span className="small text-muted">
											Goal: {formatCurrency(savingsGoal)}
										</span>
									</div>
									{savingsProgress < 100 && (
										<div className="mt-2">
											<span className="small text-info">
												{formatCurrency(
													savingsGoal - currentSavings
												)}{" "}
												remaining
											</span>
										</div>
									)}
								</div>
							</div>
							<div className="col-md-4">
								<div className="p-3 border rounded text-center">
									<div
										className={`h4 mb-1 text-${
											netCashFlow >= 0
												? "success"
												: "danger"
										}`}
									>
										{netCashFlow >= 0 ? "👍" : "⚠️"}
									</div>
									<p className="small text-muted mb-1">
										Financial Health
									</p>
									<p className="fw-medium mb-0">
										{netCashFlow >= 0
											? "Good"
											: "Needs Attention"}
									</p>
									{netCashFlow < 0 && (
										<p className="small text-danger mb-0">
											Review your spending
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Quick Tips */}
				<div className="mt-4 pt-3 border-top">
					<div className="row">
						<div className="col-12">
							<h6 className="text-muted mb-2">💡 Quick Tips</h6>
							<div className="row g-2">
								{monthlyIncome === 0 && (
									<div className="col-md-6">
										<div className="alert alert-info py-2 px-3 mb-0">
											<small>
												No income recorded this month.
												Make sure to record all
												deposits.
											</small>
										</div>
									</div>
								)}
								{monthlySpending === 0 && (
									<div className="col-md-6">
										<div className="alert alert-warning py-2 px-3 mb-0">
											<small>
												No spending recorded this month.
												Track your expenses for better
												insights.
											</small>
										</div>
									</div>
								)}
								{savingsProgress >= 100 && (
									<div className="col-md-6">
										<div className="alert alert-success py-2 px-3 mb-0">
											<small>
												🎉 Congratulations! You've
												reached your savings goal!
											</small>
										</div>
									</div>
								)}
								{netCashFlow > 0 && monthlyIncome > 0 && (
									<div className="col-md-6">
										<div className="alert alert-success py-2 px-3 mb-0">
											<small>
												Great! You're saving{" "}
												{(
													(netCashFlow /
														monthlyIncome) *
													100
												).toFixed(1)}
												% of your income.
											</small>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default FinancialInsights;
