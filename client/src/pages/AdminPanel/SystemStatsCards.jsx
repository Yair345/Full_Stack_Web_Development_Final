import { Users, Activity, TrendingUp, DollarSign } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency, formatNumber } from "./adminUtils";

const SystemStatsCards = ({ systemStats }) => {
	const stats = [
		{
			id: 1,
			title: "Total Users",
			value: formatNumber(systemStats.totalUsers),
			icon: Users,
			color: "primary",
			trend: `+${systemStats.newUsersToday} today`,
			trendColor: "success",
		},
		{
			id: 2,
			title: "Active Users",
			value: formatNumber(systemStats.activeUsers),
			icon: Activity,
			color: "success",
			trend: `${(
				(systemStats.activeUsers / systemStats.totalUsers) *
				100
			).toFixed(1)}% of total`,
			trendColor: "muted",
		},
		{
			id: 3,
			title: "Transactions",
			value: formatNumber(systemStats.totalTransactions),
			icon: TrendingUp,
			color: "info",
			trend: `+${systemStats.transactionsToday} today`,
			trendColor: "success",
		},
		{
			id: 4,
			title: "Total Volume",
			value: formatCurrency(systemStats.totalVolume),
			icon: DollarSign,
			color: "warning",
			trend: "All time",
			trendColor: "muted",
		},
	];

	return (
		<div className="col-12">
			<div className="row g-3">
				{stats.map((stat) => {
					const IconComponent = stat.icon;
					return (
						<div key={stat.id} className="col-md-3">
							<Card>
								<div className="d-flex align-items-center">
									<div
										className={`bg-${stat.color} bg-opacity-10 rounded p-2 me-3`}
									>
										<IconComponent
											size={24}
											className={`text-${stat.color}`}
										/>
									</div>
									<div>
										<p className="small text-muted mb-1">
											{stat.title}
										</p>
										<p className="h5 fw-bold mb-0">
											{stat.value}
										</p>
										<small
											className={`text-${stat.trendColor}`}
										>
											{stat.trend}
										</small>
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

export default SystemStatsCards;
