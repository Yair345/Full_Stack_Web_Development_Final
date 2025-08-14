import { useState, useEffect } from "react";
import BranchHeader from "./BranchHeader";
import BranchTabs from "./BranchTabs";
import OverviewTab from "./OverviewTab";
import CustomersTab from "./CustomersTab";
import LoanApplicationsTab from "./LoanApplicationsTab";
import ReportsTab from "./ReportsTab";
import { mockBranchData } from "./branchUtils";

const BranchManagement = () => {
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [branchData, setBranchData] = useState({});

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setBranchData(mockBranchData);
			} catch (err) {
				console.error("Error loading branch data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

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
						branchStats={branchData.branchStats}
						branchInfo={branchData.branchInfo}
						onQuickActions={handleQuickActions}
					/>
				);
			case "customers":
				return (
					<CustomersTab
						customers={branchData.branchCustomers || []}
						onAddCustomer={handleAddCustomer}
						onCustomerAction={handleCustomerAction}
					/>
				);
			case "loans":
				return (
					<LoanApplicationsTab
						loanApplications={branchData.loanApplications || []}
						onNewApplication={handleNewApplication}
						onLoanAction={handleLoanAction}
					/>
				);
			case "reports":
				return (
					<ReportsTab
						recentReports={branchData.recentReports || []}
						onGenerateReport={handleGenerateReport}
						onDownloadReport={handleDownloadReport}
					/>
				);
			default:
				return null;
		}
	};

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
									Loading...
								</span>
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
					branchInfo={branchData.branchInfo}
					onBranchReport={handleBranchReport}
					onScheduleMeeting={handleScheduleMeeting}
				/>

				<BranchTabs activeTab={activeTab} onTabChange={setActiveTab} />

				{renderTabContent()}
			</div>
		</div>
	);
};

export default BranchManagement;
