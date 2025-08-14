import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import QuickStatsCards from "./QuickStatsCards";
import AccountsOverview from "./AccountsOverview";
import RecentTransactions from "./RecentTransactions";
import FinancialInsights from "./FinancialInsights";
import { mockDashboardData } from "./dashboardUtils";

const Dashboard = () => {
	const [dashboardData] = useState(mockDashboardData);

	const handleViewAllTransactions = () => {
		// In a real app, this would navigate to the transactions page
		console.log("Navigate to transactions page");
	};

	return (
		<div className="container-fluid p-4">
			<div className="row g-4">
				<DashboardHeader />

				<QuickStatsCards
					accounts={dashboardData.accounts}
					transactions={dashboardData.recentTransactions}
				/>

				<FinancialInsights
					transactions={dashboardData.recentTransactions}
					accounts={dashboardData.accounts}
					savingsGoal={dashboardData.savingsGoal}
				/>

				<AccountsOverview accounts={dashboardData.accounts} />

				<RecentTransactions
					transactions={dashboardData.recentTransactions}
					onViewAll={handleViewAllTransactions}
				/>
			</div>
		</div>
	);
};

export default Dashboard;
