import BranchPerformanceCard from "./BranchPerformanceCard";
import BranchInfoCard from "./BranchInfoCard";

const OverviewTab = ({ branchInfo }) => {
	return (
		<>
			<BranchPerformanceCard />

			<BranchInfoCard branchInfo={branchInfo} />
		</>
	);
};

export default OverviewTab;
