import { TrendingUp, CreditCard, ArrowUpRight, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import {
	formatCurrency,
	calculateTotalBalance,
	calculateNetWorth,
	getFinancialHealthScore,
} from "./dashboardUtils";

const QuickStatsCards = ({ accounts, transactions }) => {
	const totalBalance = calculateNetWorth(accounts);
	const financialHealth = getFinancialHealthScore(accounts, transactions);

	const stats = [
		{
			id: 1,
			title: "Total Balance",
			value: formatCurrency(totalBalance),
			icon: TrendingUp,
			color: totalBalance >= 0 ? "success" : "danger",
			subtext: totalBalance >= 0 ? "Net worth" : "Net debt",
		},
		{
			id: 2,
			title: "Active Accounts",
			value: accounts.length,
			icon: CreditCard,
			color: "primary",
			subtext: "Connected accounts",
		},
		{
			id: 3,
			title: "Financial Health",
			value: `${financialHealth}%`,
			icon: ArrowUpRight,
			color:
				financialHealth >= 70
					? "success"
					: financialHealth >= 40
					? "warning"
					: "danger",
			subtext:
				financialHealth >= 70
					? "Excellent"
					: financialHealth >= 40
					? "Good"
					: "Needs attention",
		},
	];

	return (
		<div className="col-12">
			<div className="row g-3">
				{stats.map((stat) => {
					const IconComponent = stat.icon;
					return (
						<div key={stat.id} className="col-md-4">
							<Card>
								<div className="d-flex align-items-center">
									<div className="flex-shrink-0">
										<IconComponent
											size={32}
											className={`text-${stat.color}`}
										/>
									</div>
									<div className="ms-3">
										<p className="small text-muted mb-1">
											{stat.title}
										</p>
										<p className="h4 fw-bold mb-0">
											{stat.value}
										</p>
										<p
											className={`small mb-0 text-${stat.color}`}
										>
											{stat.subtext}
										</p>
									</div>
								</div>
							</Card>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default QuickStatsCards;
