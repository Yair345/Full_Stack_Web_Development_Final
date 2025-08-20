import SystemStatsCards from "./SystemStatsCards";
import BranchesOverviewCard from "./BranchesOverviewCard";
import RecentAlertsCard from "./RecentAlertsCard";

const OverviewTab = ({ systemStats, services, alerts }) => {
	return (
		<>
			<SystemStatsCards systemStats={systemStats} />

			<BranchesOverviewCard systemStats={systemStats} />

			<RecentAlertsCard
				alerts={alerts}
				alertsCount={systemStats?.alertsCount}
			/>
		</>
	);
};

export default OverviewTab;
