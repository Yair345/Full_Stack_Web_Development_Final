import { TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";
import Card from "../../components/ui/Card";
import {
	formatCurrency,
	calculateMonthlyIncome,
	calculateMonthlySpending,
	getSavingsProgress,
} from "./dashboardUtils";

const FinancialInsights = ({ transactions, accounts, savingsGoal = 20000 }) => {
	const monthlyIncome = calculateMonthlyIncome(transactions);
	const monthlySpending = calculateMonthlySpending(transactions);
	const currentSavings =
		accounts.find((acc) => acc.type === "savings")?.balance || 0;
	const savingsProgress = getSavingsProgress(currentSavings, savingsGoal);
	const netCashFlow = monthlyIncome - monthlySpending;

	const insights = [
		{
			id: 1,
			title: "Monthly Income",
			value: formatCurrency(monthlyIncome),
			icon: TrendingUp,
			color: "success",
			trend: "+12% from last month",
		},
		{
			id: 2,
			title: "Monthly Spending",
			value: formatCurrency(monthlySpending),
			icon: TrendingDown,
			color: "danger",
			trend: "-5% from last month",
		},
		{
			id: 3,
			title: "Net Cash Flow",
			value: formatCurrency(netCashFlow),
			icon: DollarSign,
			color: netCashFlow >= 0 ? "success" : "danger",
			trend:
				netCashFlow >= 0
					? "Saving money"
					: "Spending more than earning",
		},
		{
			id: 4,
			title: "Savings Goal",
			value: `${savingsProgress}%`,
			icon: Target,
			color:
				savingsProgress >= 75
					? "success"
					: savingsProgress >= 50
					? "warning"
					: "danger",
			trend: `${formatCurrency(currentSavings)} of ${formatCurrency(
				savingsGoal
			)}`,
		},
	];

	return (
		<div className="col-12">
			<Card>
				<h2 className="h5 fw-medium mb-4">Financial Insights</h2>
				<div className="row g-3">
					{insights.map((insight) => {
						const IconComponent = insight.icon;
						return (
							<div key={insight.id} className="col-md-6 col-lg-3">
								<div className="d-flex align-items-center p-3 border rounded">
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

				{/* Savings Progress Bar */}
				{savingsGoal > 0 && (
					<div className="mt-4 p-3 bg-light rounded">
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span className="small text-muted">
								Savings Goal Progress
							</span>
							<span className="small fw-medium">
								{savingsProgress}%
							</span>
						</div>
						<div className="progress" style={{ height: "8px" }}>
							<div
								className={`progress-bar bg-${
									savingsProgress >= 75
										? "success"
										: savingsProgress >= 50
										? "warning"
										: "danger"
								}`}
								style={{
									width: `${Math.min(100, savingsProgress)}%`,
								}}
							></div>
						</div>
						<div className="d-flex justify-content-between mt-2">
							<span className="small text-muted">
								{formatCurrency(currentSavings)}
							</span>
							<span className="small text-muted">
								{formatCurrency(savingsGoal)}
							</span>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
};

export default FinancialInsights;
