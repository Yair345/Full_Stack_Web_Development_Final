import BranchStatsCards from "./BranchStatsCards";
import BranchPerformanceCard from "./BranchPerformanceCard";
import BranchSidebarCards from "./BranchSidebarCards";

const OverviewTab = ({ branchStats, branchInfo, onQuickActions }) => {
	return (
		<>
			<BranchStatsCards branchStats={branchStats} />

			<BranchPerformanceCard branchStats={branchStats} />

			<BranchSidebarCards
				branchInfo={branchInfo}
				onAddCustomer={onQuickActions.addCustomer}
				onReviewApplications={onQuickActions.reviewApplications}
				onScheduleAppointments={onQuickActions.scheduleAppointments}
				onBranchSettings={onQuickActions.branchSettings}
			/>
		</>
	);
};

export default OverviewTab;
