import { Users, Activity, TrendingUp, DollarSign } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency, formatNumber } from "./adminUtils";

const SystemStatsCards = ({ systemStats }) => {
	// Safely handle undefined systemStats
	const stats = systemStats || {};

	const cardStats = [
		{
			id: 1,
			title: "Total Users",
			value: formatNumber(stats.totalUsers || 0),
			icon: Users,
			color: "primary",
			trend: `${formatNumber(stats.activeUsers || 0)} active`,
			trendColor: "success",
		},
		{
			id: 2,
			title: "Active Users",
			value: formatNumber(stats.activeUsers || 0),
			icon: Activity,
			color: "success",
			trend:
				stats.totalUsers > 0
					? `${(
							((stats.activeUsers || 0) /
								(stats.totalUsers || 1)) *
							100
					  ).toFixed(1)}% of total`
					: "0% of total",
			trendColor: "muted",
		},
		{
			id: 3,
			title: "Transactions",
			value: formatNumber(stats.todayTransactions || 0),
			icon: TrendingUp,
			color: "info",
			trend: "Today",
			trendColor: "success",
		},
		{
			id: 4,
			title: "Total Volume",
			value: formatCurrency(stats.totalTransactionVolume || 0),
			icon: DollarSign,
			color: "warning",
			trend: "All time",
			trendColor: "muted",
		},
	];

	return (
		<div className="col-12">
			<div className="row g-3">
				{cardStats.map((stat) => {
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
