import SystemStatsCards from "./SystemStatsCards";
import SystemHealthCard from "./SystemHealthCard";
import RecentAlertsCard from "./RecentAlertsCard";

const OverviewTab = ({ systemStats, services, alerts }) => {
	return (
		<>
			<SystemStatsCards systemStats={systemStats} />

			<SystemHealthCard systemStats={systemStats} services={services} />

			<RecentAlertsCard
				alerts={alerts}
				alertsCount={systemStats.alertsCount}
			/>
		</>
	);
};

export default OverviewTab;
