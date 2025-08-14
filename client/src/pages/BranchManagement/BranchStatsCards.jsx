import { Users, DollarSign, FileText, TrendingUp } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency, formatNumber } from "./branchUtils";

const BranchStatsCards = ({ branchStats }) => {
	const stats = [
		{
			id: 1,
			title: "Total Customers",
			value: formatNumber(branchStats.totalCustomers),
			icon: Users,
			color: "primary",
			trend: `+${branchStats.newCustomersThisMonth} this month`,
			trendColor: "success",
		},
		{
			id: 2,
			title: "Total Deposits",
			value: formatCurrency(branchStats.totalDeposits),
			icon: DollarSign,
			color: "success",
			trend: `${formatNumber(branchStats.totalAccounts)} accounts`,
			trendColor: "muted",
		},
		{
			id: 3,
			title: "Pending Applications",
			value: branchStats.pendingApplications,
			icon: FileText,
			color: "warning",
			trend: "Require attention",
			trendColor: "muted",
		},
		{
			id: 4,
			title: "Monthly Revenue",
			value: formatCurrency(branchStats.branchRevenue),
			icon: TrendingUp,
			color: "info",
			trend: "↑ 12% vs last month",
			trendColor: "success",
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

export default BranchStatsCards;
