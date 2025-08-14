import { useState, useEffect } from "react";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";
import OverviewTab from "./OverviewTab";
import UserManagementTab from "./UserManagementTab";
import ActivityLogTab from "./ActivityLogTab";
import SystemHealthTab from "./SystemHealthTab";
import { mockAdminData } from "./adminUtils";

const AdminPanel = () => {
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [adminData, setAdminData] = useState({});

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setAdminData(mockAdminData);
			} catch (err) {
				console.error("Error loading admin data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const handleGenerateReport = () => {
		console.log("Generating admin report...");
		alert(
			"Report generation started! You will receive an email when it's ready."
		);
	};

	const handleSystemSettings = () => {
		console.log("Opening system settings...");
		alert("System settings will be implemented soon!");
	};

	const handleAddUser = () => {
		console.log("Adding new user...");
		alert("Add user functionality will be implemented soon!");
	};

	const handleUserAction = (action, userId) => {
		console.log(`${action} user:`, userId);
		alert(`${action} user action will be implemented soon!`);
	};

	const handleExportLog = () => {
		console.log("Exporting activity log...");
		alert("Activity log export started!");
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<OverviewTab
						systemStats={adminData.systemStats}
						services={adminData.systemServices}
						alerts={adminData.systemAlerts}
					/>
				);
			case "users":
				return (
					<UserManagementTab
						users={adminData.users || []}
						onAddUser={handleAddUser}
						onUserAction={handleUserAction}
					/>
				);
			case "activity":
				return (
					<ActivityLogTab
						recentActivity={adminData.recentActivity || []}
						onExportLog={handleExportLog}
					/>
				);
			case "system":
				return (
					<SystemHealthTab
						services={adminData.systemServices || []}
						performanceMetrics={adminData.performanceMetrics || {}}
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
				<AdminHeader
					onGenerateReport={handleGenerateReport}
					onSystemSettings={handleSystemSettings}
				/>

				<AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

				{renderTabContent()}
			</div>
		</div>
	);
};

export default AdminPanel;
