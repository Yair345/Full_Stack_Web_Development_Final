import { useState, useEffect } from "react";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";
import OverviewTab from "./OverviewTab";
import UserManagementTab from "./UserManagementTab";
import BranchManagementTab from "./BranchManagementTab";
import ActivityLogTab from "./ActivityLogTab";
import adminService from "../../services/adminService";
import { mockAdminData } from "./adminUtils";
import ViewUserModal from "../../components/ui/ViewUserModal";
import EditUserModal from "../../components/ui/EditUserModal";

const AdminPanel = () => {
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [adminData, setAdminData] = useState({});
	const [users, setUsers] = useState([]);
	const [branches, setBranches] = useState([]);
	const [availableManagers, setAvailableManagers] = useState([]);

	// Modal states
	const [showViewUserModal, setShowViewUserModal] = useState(false);
	const [showEditUserModal, setShowEditUserModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);

			// Load admin overview data
			const overviewData = await adminService.getAdminOverview();
			setAdminData({
				systemStats: overviewData.data.systemStats,
				recentActivity: overviewData.data.recentActivity,
				systemAlerts: overviewData.data.systemAlerts,
				// Fallback to mock data for other properties
				users: mockAdminData.users,
				systemServices: mockAdminData.systemServices,
				performanceMetrics: mockAdminData.performanceMetrics,
			});

			// Load users data
			await loadUsers();

			// Load branches data
			await loadBranches();

			// Load available managers
			await loadAvailableManagers();
		} catch (err) {
			console.error("Error loading admin data:", err);
			// Fallback to mock data
			setAdminData(mockAdminData);
		} finally {
			setLoading(false);
		}
	};

	const loadUsers = async () => {
		try {
			const response = await adminService.getUsers({ limit: 100 });
			setUsers(response.data.users);
		} catch (error) {
			console.error("Error loading users:", error);
		}
	};

	const loadBranches = async () => {
		try {
			const response = await adminService.getBranches({ limit: 100 });
			setBranches(response.data.branches);
		} catch (error) {
			console.error("Error loading branches:", error);
		}
	};

	const loadAvailableManagers = async () => {
		try {
			const response = await adminService.getAvailableManagers();
			setAvailableManagers(response.data.managers);
		} catch (error) {
			console.error("Error loading available managers:", error);
		}
	};

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

	const handleUserAction = async (action, userId, reason = null) => {
		try {
			await adminService.updateUserStatus(userId, action, reason);
			await loadUsers(); // Refresh user list
			alert(`User ${action}d successfully!`);
		} catch (error) {
			console.error(`Error ${action}ing user:`, error);
			alert(`Failed to ${action} user. Please try again.`);
		}
	};

	const handleViewUser = async (user) => {
		try {
			const response = await adminService.getUserById(user.id);
			setSelectedUser(response.data.user);
			setShowViewUserModal(true);
		} catch (error) {
			console.error("Error viewing user:", error);
			alert("Failed to load user details. Please try again.");
		}
	};

	const handleEditUser = async (user) => {
		try {
			const response = await adminService.getUserById(user.id);
			setSelectedUser(response.data.user);
			setShowEditUserModal(true);
		} catch (error) {
			console.error("Error loading user for edit:", error);
			alert("Failed to load user details. Please try again.");
		}
	};

	const handleSaveUser = async (userId, userData) => {
		try {
			await adminService.updateUser(userId, userData);
			await loadUsers(); // Refresh the users list
			alert("User updated successfully!");
		} catch (error) {
			console.error("Error updating user:", error);
			alert("Failed to update user. Please try again.");
			throw error;
		}
	};

	const handleDeleteUser = async (userId, username) => {
		if (
			window.confirm(
				`Are you sure you want to delete user "${username}"?\n\nThis action cannot be undone and will:\n- Remove the user from the system\n- Close any empty accounts\n- This will fail if the user has accounts with funds`
			)
		) {
			try {
				await adminService.deleteUser(userId);
				await loadUsers(); // Refresh user list
				alert(`User "${username}" deleted successfully!`);
			} catch (error) {
				console.error("Error deleting user:", error);
				alert(
					`Failed to delete user "${username}". ${
						error.message || "Please try again."
					}`
				);
			}
		}
	};

	const handleAddBranch = async (branchData) => {
		try {
			await adminService.createBranch(branchData);
			await loadBranches();
			await loadAvailableManagers(); // Refresh available managers
		} catch (error) {
			console.error("Error adding branch:", error);
			throw error;
		}
	};

	const handleUpdateBranch = async (branchId, branchData) => {
		try {
			await adminService.updateBranch(branchId, branchData);
			await loadBranches();
			await loadAvailableManagers(); // Refresh available managers
		} catch (error) {
			console.error("Error updating branch:", error);
			throw error;
		}
	};

	const handleDeleteBranch = async (branchId) => {
		try {
			await adminService.deleteBranch(branchId);
			await loadBranches();
			await loadAvailableManagers(); // Refresh available managers
		} catch (error) {
			console.error("Error deleting branch:", error);
			throw error;
		}
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
						users={users}
						onAddUser={handleAddUser}
						onUserAction={handleUserAction}
						onViewUser={handleViewUser}
						onEditUser={handleEditUser}
						onDeleteUser={handleDeleteUser}
					/>
				);
			case "branches":
				return (
					<BranchManagementTab
						branches={branches}
						availableManagers={availableManagers}
						onAddBranch={handleAddBranch}
						onUpdateBranch={handleUpdateBranch}
						onDeleteBranch={handleDeleteBranch}
						onRefresh={() => {
							loadBranches();
							loadAvailableManagers();
						}}
					/>
				);
			case "activity":
				return (
					<ActivityLogTab
						recentActivity={adminData.recentActivity || []}
						onExportLog={handleExportLog}
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

			{/* User Modals */}
			{showViewUserModal && (
				<ViewUserModal
					user={selectedUser}
					onClose={() => {
						setShowViewUserModal(false);
						setSelectedUser(null);
					}}
				/>
			)}

			{showEditUserModal && (
				<EditUserModal
					user={selectedUser}
					onClose={() => {
						setShowEditUserModal(false);
						setSelectedUser(null);
					}}
					onSave={handleSaveUser}
					canChangeRole={true}
				/>
			)}
		</div>
	);
};

export default AdminPanel;
