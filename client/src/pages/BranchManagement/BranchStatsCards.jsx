import { Users, DollarSign, FileText, TrendingUp } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency, formatNumber } from "./branchUtils";

const BranchStatsCards = ({ branchStats }) => {
	// Safety check for branchStats and provide default values
	const safeStats = branchStats || {};
	const summary = safeStats.summary || {};
	const totals = summary.totals || {};
	const averages = summary.averages || {};

	// Show loading state if no data
	if (!branchStats) {
		return (
			<div className="col-12">
				<div className="row g-3">
					{[1, 2, 3, 4].map((index) => (
						<div key={index} className="col-md-3">
							<Card>
								<div className="d-flex align-items-center">
									<div className="bg-light rounded p-2 me-3">
										<div
											style={{
												width: 24,
												height: 24,
												backgroundColor: "#e0e0e0",
											}}
										/>
									</div>
									<div>
										<div
											className="bg-light rounded mb-2"
											style={{ width: 80, height: 12 }}
										/>
										<div
											className="bg-light rounded mb-1"
											style={{ width: 60, height: 20 }}
										/>
										<div
											className="bg-light rounded"
											style={{ width: 100, height: 10 }}
										/>
									</div>
								</div>
							</Card>
						</div>
					))}
				</div>
			</div>
		);
	}

	const stats = [
		{
			id: 1,
			title: "Total Customers",
			value: formatNumber(totals.totalCustomers || 0),
			icon: Users,
			color: "primary",
			trend: `+${totals.newCustomers || 0} this month`,
			trendColor: "success",
		},
		{
			id: 2,
			title: "Total Deposits",
			value: formatCurrency(totals.totalDeposits || 0),
			icon: DollarSign,
			color: "success",
			trend: `${formatNumber(totals.totalAccounts || 0)} accounts`,
			trendColor: "muted",
		},
		{
			id: 3,
			title: "Pending Applications",
			value: totals.pendingLoans || 0,
			icon: FileText,
			color: "warning",
			trend: "Require attention",
			trendColor: "muted",
		},
		{
			id: 4,
			title: "Monthly Revenue",
			value: formatCurrency(totals.totalRevenue || 0),
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
