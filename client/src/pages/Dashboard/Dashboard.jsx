import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import DashboardHeader from "./DashboardHeader";
import QuickStatsCards from "./QuickStatsCards";
import AccountsOverview from "./AccountsOverview";
import RecentTransactions from "./RecentTransactions";
import FinancialInsights from "./FinancialInsights";
import { useDashboard } from "../../hooks/api/apiHooks";

const Dashboard = () => {
	const navigate = useNavigate();
	const refreshIntervalRef = useRef(null);

	const {
		accounts = [],
		recentTransactions = [],
		loading,
		error,
		refetch,
	} = useDashboard();

	const handleViewAllTransactions = () => {
		navigate("/transactions");
	};

	const handleRefresh = () => {
		refetch();
	};

	// Set up auto-refresh every 5 minutes
	useEffect(() => {
		// Only set up auto-refresh if not loading and no error
		if (!loading && !error) {
			refreshIntervalRef.current = setInterval(() => {
				refetch();
			}, 5 * 60 * 1000); // 5 minutes
		}

		// Cleanup on unmount or when dependencies change
		return () => {
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
			}
		};
	}, [loading, error, refetch]);

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
			}
		};
	}, []);

	// Show loading state
	if (loading) {
		return (
			<div className="container-fluid p-4">
				<div className="row g-4">
					<div className="col-12">
						<div
							className="d-flex justify-content-center align-items-center"
							style={{ minHeight: "300px" }}
						>
							<div
								className="spinner-border text-primary"
								role="status"
							>
								<span className="visually-hidden">
									Loading...
								</span>
							</div>
							<span className="ms-3">
								Loading your dashboard...
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="container-fluid p-4">
				<div className="row g-4">
					<div className="col-12">
						<div
							className="alert alert-danger d-flex align-items-center"
							role="alert"
						>
							<div className="me-3">
								<svg
									width="24"
									height="24"
									fill="currentColor"
									className="bi bi-exclamation-triangle-fill"
								>
									<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
								</svg>
							</div>
							<div className="flex-grow-1">
								<h6 className="mb-1">
									Error Loading Dashboard
								</h6>
								<p className="mb-2">
									{error?.message ||
										"Unable to load your dashboard data. Please try again."}
								</p>
								<button
									className="btn btn-outline-danger btn-sm"
									onClick={handleRefresh}
								>
									Try Again
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Default savings goal if not available from API
	const savingsGoal = 20000;

	return (
		<div className="container-fluid p-4">
			<div className="row g-4">
				<DashboardHeader onRefresh={handleRefresh} />

				<QuickStatsCards
					accounts={accounts}
					transactions={recentTransactions}
				/>

				<FinancialInsights
					transactions={recentTransactions}
					accounts={accounts}
					savingsGoal={savingsGoal}
				/>

				<AccountsOverview accounts={accounts} />

				<RecentTransactions
					transactions={recentTransactions}
					onViewAll={handleViewAllTransactions}
				/>
			</div>
		</div>
	);
};

export default Dashboard;
