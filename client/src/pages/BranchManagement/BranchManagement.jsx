import { useState, useEffect } from "react";
import BranchHeader from "./BranchHeader";
import BranchTabs from "./BranchTabs";
import OverviewTab from "./OverviewTab";
import CustomersTab from "./CustomersTab";
import LoanApplicationsTab from "./LoanApplicationsTab";
import ReportsTab from "./ReportsTab";
import {
	useBranch,
	useBranchStats,
	useBranchCustomers,
	useBranchLoans,
} from "../../hooks/api/apiHooks";
import { useAuth } from "../../hooks";

const BranchManagement = () => {
	const [activeTab, setActiveTab] = useState("overview");
	const { user } = useAuth();

	// For this demo, we'll use the first branch or user's branch
	// In a real app, this would be determined by user's role and assignments
	const branchId = user?.branch_id || 1;

	// Fetch branch data
	const {
		data: branchResponse,
		loading: branchLoading,
		error: branchError,
		refetch: refetchBranch,
	} = useBranch(branchId);
	const {
		data: statsResponse,
		loading: statsLoading,
		error: statsError,
		refetch: refetchStats,
	} = useBranchStats(branchId);
	const {
		data: customersResponse,
		loading: customersLoading,
		error: customersError,
		refetch: refetchCustomers,
	} = useBranchCustomers(branchId);
	const {
		data: loansResponse,
		loading: loansLoading,
		error: loansError,
		refetch: refetchLoans,
	} = useBranchLoans(branchId, { status: "pending" });

	// Extract data from responses
	const branch = branchResponse?.data?.branch;
	const branchStats = statsResponse?.data;
	const customers = customersResponse?.data?.customers || [];
	const loanApplications = loansResponse?.data?.loans || [];

	const loading = branchLoading || statsLoading;
	const error = branchError || statsError;

	const handleRefresh = () => {
		refetchBranch();
		refetchStats();
		refetchCustomers();
		refetchLoans();
	};

	const handleBranchReport = () => {
		console.log("Generating branch report...");
		alert("Branch report generation started!");
	};

	const handleScheduleMeeting = () => {
		console.log("Scheduling meeting...");
		alert("Meeting scheduler will be implemented soon!");
	};

	const handleQuickActions = {
		addCustomer: () => {
			console.log("Adding new customer...");
			alert("Add customer functionality will be implemented soon!");
		},
		reviewApplications: () => {
			console.log("Reviewing applications...");
			setActiveTab("loans");
		},
		scheduleAppointments: () => {
			console.log("Scheduling appointments...");
			alert("Appointment scheduler will be implemented soon!");
		},
		branchSettings: () => {
			console.log("Opening branch settings...");
			alert("Branch settings will be implemented soon!");
		},
	};

	const handleAddCustomer = () => {
		console.log("Adding new customer...");
		alert("Add customer functionality will be implemented soon!");
	};

	const handleCustomerAction = (action, customerId) => {
		console.log(`${action} customer:`, customerId);
		alert(`${action} customer action will be implemented soon!`);
	};

	const handleNewApplication = () => {
		console.log("Creating new loan application...");
		alert("New loan application form will be implemented soon!");
	};

	const handleLoanAction = (action, applicationId) => {
		console.log(`${action} loan application:`, applicationId);
		alert(`${action} loan application will be implemented soon!`);
	};

	const handleGenerateReport = (reportType) => {
		console.log("Generating report:", reportType);
		alert(`${reportType} report generation started!`);
	};

	const handleDownloadReport = (reportId) => {
		console.log("Downloading report:", reportId);
		alert("Report download started!");
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<OverviewTab
						branchStats={branchStats}
						branchInfo={branch}
						onQuickActions={handleQuickActions}
					/>
				);
			case "customers":
				return (
					<CustomersTab
						customers={customers}
						loading={customersLoading}
						error={customersError}
						onAddCustomer={handleAddCustomer}
						onCustomerAction={handleCustomerAction}
						onRefresh={refetchCustomers}
					/>
				);
			case "loans":
				return (
					<LoanApplicationsTab
						loanApplications={loanApplications}
						loading={loansLoading}
						error={loansError}
						onNewApplication={handleNewApplication}
						onLoanAction={handleLoanAction}
						onRefresh={refetchLoans}
					/>
				);
			case "reports":
				return (
					<ReportsTab
						recentReports={[]} // Will be implemented later
						onGenerateReport={handleGenerateReport}
						onDownloadReport={handleDownloadReport}
					/>
				);
			default:
				return null;
		}
	};

	// Show loading state
	if (loading) {
		return (
			<div className="container-fluid p-4">
				<div className="row g-4">
					<div className="col-12">
						<div className="d-flex justify-content-center py-5">
							<div
								className="spinner-border text-primary"
								role="status"
							>
								<span className="visually-hidden">
									Loading branch data...
								</span>
							</div>
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
									Error Loading Branch Data
								</h6>
								<p className="mb-2">
									{error?.message ||
										"Unable to load branch data. Please try again."}
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

	return (
		<div className="container-fluid p-4">
			<div className="row g-4">
				<BranchHeader
					branchInfo={branch}
					onBranchReport={handleBranchReport}
					onScheduleMeeting={handleScheduleMeeting}
					onRefresh={handleRefresh}
				/>

				<BranchTabs activeTab={activeTab} onTabChange={setActiveTab} />

				{renderTabContent()}
			</div>
		</div>
	);
};

export default BranchManagement;
