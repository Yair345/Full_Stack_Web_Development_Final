import { useState, useEffect } from "react";
import {
	Users,
	Activity,
	DollarSign,
	Shield,
	Settings,
	AlertTriangle,
	TrendingUp,
	Database,
	FileText,
	Search,
	Filter,
	MoreVertical,
	Eye,
	Lock,
	Unlock,
	UserCheck,
	UserX,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const AdminPanel = () => {
	const [users, setUsers] = useState([]);
	const [systemStats, setSystemStats] = useState({});
	const [recentActivity, setRecentActivity] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");

	// Mock data for admin panel
	const mockSystemStats = {
		totalUsers: 12547,
		activeUsers: 8932,
		totalTransactions: 45823,
		totalVolume: 23847562.45,
		newUsersToday: 47,
		transactionsToday: 1234,
		systemHealth: 98.5,
		alertsCount: 3,
	};

	const mockUsers = [
		{
			id: 1,
			name: "John Doe",
			email: "john.doe@email.com",
			status: "active",
			role: "customer",
			lastLogin: "2025-08-15 10:30",
			accounts: 3,
			totalBalance: 45650.75,
			joinDate: "2023-05-15",
			riskLevel: "low",
		},
		{
			id: 2,
			name: "Sarah Johnson",
			email: "sarah.j@email.com",
			status: "suspended",
			role: "customer",
			lastLogin: "2025-08-14 16:22",
			accounts: 2,
			totalBalance: 12300.5,
			joinDate: "2024-01-10",
			riskLevel: "medium",
		},
		{
			id: 3,
			name: "Mike Wilson",
			email: "mike.w@email.com",
			status: "pending",
			role: "customer",
			lastLogin: "Never",
			accounts: 0,
			totalBalance: 0,
			joinDate: "2025-08-14",
			riskLevel: "low",
		},
		{
			id: 4,
			name: "Emma Davis",
			email: "emma.davis@email.com",
			status: "active",
			role: "branch_manager",
			lastLogin: "2025-08-15 09:15",
			accounts: 1,
			totalBalance: 8500.0,
			joinDate: "2022-03-20",
			riskLevel: "low",
		},
		{
			id: 5,
			name: "Robert Brown",
			email: "robert.b@email.com",
			status: "locked",
			role: "customer",
			lastLogin: "2025-08-12 14:45",
			accounts: 4,
			totalBalance: 125000.0,
			joinDate: "2021-11-05",
			riskLevel: "high",
		},
	];

	const mockRecentActivity = [
		{
			id: 1,
			type: "user_registration",
			description: "New user registered: mike.w@email.com",
			timestamp: "2025-08-15 11:45",
			severity: "info",
		},
		{
			id: 2,
			type: "suspicious_activity",
			description:
				"Multiple failed login attempts detected for user robert.b@email.com",
			timestamp: "2025-08-15 11:30",
			severity: "warning",
		},
		{
			id: 3,
			type: "large_transaction",
			description:
				"Large transaction alert: $45,000 transfer by john.doe@email.com",
			timestamp: "2025-08-15 11:15",
			severity: "info",
		},
		{
			id: 4,
			type: "system_maintenance",
			description: "Scheduled system maintenance completed successfully",
			timestamp: "2025-08-15 03:00",
			severity: "success",
		},
		{
			id: 5,
			type: "account_suspended",
			description:
				"Account suspended: sarah.j@email.com (Risk assessment)",
			timestamp: "2025-08-14 16:30",
			severity: "warning",
		},
	];

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setUsers(mockUsers);
				setSystemStats(mockSystemStats);
				setRecentActivity(mockRecentActivity);
			} catch (err) {
				console.error("Error loading admin data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const getStatusBadge = (status) => {
		const statusMap = {
			active: { class: "bg-success", text: "Active" },
			suspended: { class: "bg-warning", text: "Suspended" },
			locked: { class: "bg-danger", text: "Locked" },
			pending: { class: "bg-info", text: "Pending" },
		};
		const statusInfo = statusMap[status] || {
			class: "bg-secondary",
			text: "Unknown",
		};
		return (
			<span className={`badge ${statusInfo.class}`}>
				{statusInfo.text}
			</span>
		);
	};

	const getRiskBadge = (level) => {
		const riskMap = {
			low: { class: "bg-success", text: "Low" },
			medium: { class: "bg-warning", text: "Medium" },
			high: { class: "bg-danger", text: "High" },
		};
		const riskInfo = riskMap[level] || {
			class: "bg-secondary",
			text: "Unknown",
		};
		return (
			<span className={`badge ${riskInfo.class}`}>{riskInfo.text}</span>
		);
	};

	const getSeverityIcon = (severity) => {
		switch (severity) {
			case "success":
				return (
					<div className="bg-success rounded-circle p-1 me-2">
						<UserCheck size={12} className="text-white" />
					</div>
				);
			case "warning":
				return (
					<div className="bg-warning rounded-circle p-1 me-2">
						<AlertTriangle size={12} className="text-white" />
					</div>
				);
			case "error":
				return (
					<div className="bg-danger rounded-circle p-1 me-2">
						<UserX size={12} className="text-white" />
					</div>
				);
			default:
				return (
					<div className="bg-info rounded-circle p-1 me-2">
						<Activity size={12} className="text-white" />
					</div>
				);
		}
	};

	const handleUserAction = (action, userId) => {
		console.log(`${action} user:`, userId);
		alert(`${action} user action will be implemented soon!`);
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesFilter =
			filterStatus === "all" || user.status === filterStatus;
		return matchesSearch && matchesFilter;
	});

	if (loading) {
		return (
			<div className="row g-4">
				<div className="col-12">
					<div className="d-flex justify-content-center py-5">
						<div
							className="spinner-border text-primary"
							role="status"
						>
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="row g-4">
			{/* Header */}
			<div className="col-12">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<div>
						<h1 className="h2 fw-bold text-dark mb-1">
							Admin Panel
						</h1>
						<p className="text-muted mb-0">
							System administration and user management
						</p>
					</div>
					<div className="d-flex gap-2">
						<Button variant="outline">
							<Settings size={16} className="me-2" />
							System Settings
						</Button>
						<Button variant="primary">
							<FileText size={16} className="me-2" />
							Generate Report
						</Button>
					</div>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="col-12">
				<ul className="nav nav-pills mb-4">
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "overview" ? "active" : ""
							}`}
							onClick={() => setActiveTab("overview")}
						>
							<Activity size={16} className="me-2" />
							Overview
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "users" ? "active" : ""
							}`}
							onClick={() => setActiveTab("users")}
						>
							<Users size={16} className="me-2" />
							User Management
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "activity" ? "active" : ""
							}`}
							onClick={() => setActiveTab("activity")}
						>
							<Shield size={16} className="me-2" />
							Activity Log
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "system" ? "active" : ""
							}`}
							onClick={() => setActiveTab("system")}
						>
							<Database size={16} className="me-2" />
							System Health
						</button>
					</li>
				</ul>
			</div>

			{/* Overview Tab */}
			{activeTab === "overview" && (
				<>
					{/* System Stats */}
					<div className="col-12">
						<div className="row g-3">
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-primary bg-opacity-10 rounded p-2 me-3">
											<Users
												size={24}
												className="text-primary"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Total Users
											</p>
											<p className="h5 fw-bold mb-0">
												{systemStats.totalUsers?.toLocaleString()}
											</p>
											<small className="text-success">
												+{systemStats.newUsersToday}{" "}
												today
											</small>
										</div>
									</div>
								</Card>
							</div>
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-success bg-opacity-10 rounded p-2 me-3">
											<Activity
												size={24}
												className="text-success"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Active Users
											</p>
											<p className="h5 fw-bold mb-0">
												{systemStats.activeUsers?.toLocaleString()}
											</p>
											<small className="text-muted">
												{(
													(systemStats.activeUsers /
														systemStats.totalUsers) *
													100
												).toFixed(1)}
												% of total
											</small>
										</div>
									</div>
								</Card>
							</div>
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-info bg-opacity-10 rounded p-2 me-3">
											<TrendingUp
												size={24}
												className="text-info"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Transactions
											</p>
											<p className="h5 fw-bold mb-0">
												{systemStats.totalTransactions?.toLocaleString()}
											</p>
											<small className="text-success">
												+{systemStats.transactionsToday}{" "}
												today
											</small>
										</div>
									</div>
								</Card>
							</div>
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-warning bg-opacity-10 rounded p-2 me-3">
											<DollarSign
												size={24}
												className="text-warning"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Total Volume
											</p>
											<p className="h5 fw-bold mb-0">
												{formatCurrency(
													systemStats.totalVolume
												)}
											</p>
											<small className="text-muted">
												All time
											</small>
										</div>
									</div>
								</Card>
							</div>
						</div>
					</div>

					{/* System Health & Alerts */}
					<div className="col-lg-8">
						<Card>
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h5 className="fw-medium mb-0">
									System Health
								</h5>
								<span className="badge bg-success">
									Operational
								</span>
							</div>

							<div className="row g-4">
								<div className="col-md-6">
									<div className="text-center">
										<div className="position-relative d-inline-block">
											<div
												className="bg-success rounded-circle d-flex align-items-center justify-content-center"
												style={{
													width: "80px",
													height: "80px",
												}}
											>
												<span className="h4 fw-bold text-white mb-0">
													{systemStats.systemHealth}%
												</span>
											</div>
										</div>
										<p className="fw-medium mt-2 mb-0">
											System Uptime
										</p>
										<small className="text-muted">
											Last 30 days
										</small>
									</div>
								</div>
								<div className="col-md-6">
									<div className="list-group list-group-flush">
										<div className="list-group-item d-flex justify-content-between align-items-center px-0">
											<span>Database</span>
											<span className="badge bg-success">
												Online
											</span>
										</div>
										<div className="list-group-item d-flex justify-content-between align-items-center px-0">
											<span>API Services</span>
											<span className="badge bg-success">
												Online
											</span>
										</div>
										<div className="list-group-item d-flex justify-content-between align-items-center px-0">
											<span>Payment Gateway</span>
											<span className="badge bg-success">
												Online
											</span>
										</div>
										<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
											<span>Backup Systems</span>
											<span className="badge bg-success">
												Active
											</span>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>

					<div className="col-lg-4">
						<Card>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h6 className="fw-medium mb-0">
									Recent Alerts
								</h6>
								<span className="badge bg-warning">
									{systemStats.alertsCount}
								</span>
							</div>
							<div className="list-group list-group-flush">
								<div className="list-group-item d-flex align-items-center px-0">
									<AlertTriangle
										size={16}
										className="text-warning me-2"
									/>
									<div className="flex-grow-1">
										<small className="fw-medium d-block">
											High Volume Detected
										</small>
										<small className="text-muted">
											2 hours ago
										</small>
									</div>
								</div>
								<div className="list-group-item d-flex align-items-center px-0">
									<Shield
										size={16}
										className="text-info me-2"
									/>
									<div className="flex-grow-1">
										<small className="fw-medium d-block">
											Security Scan Complete
										</small>
										<small className="text-muted">
											4 hours ago
										</small>
									</div>
								</div>
								<div className="list-group-item d-flex align-items-center px-0 border-bottom-0">
									<Database
										size={16}
										className="text-success me-2"
									/>
									<div className="flex-grow-1">
										<small className="fw-medium d-block">
											Backup Completed
										</small>
										<small className="text-muted">
											6 hours ago
										</small>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</>
			)}

			{/* User Management Tab */}
			{activeTab === "users" && (
				<>
					<div className="col-12">
						<Card>
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h5 className="fw-medium mb-0">
									User Management
								</h5>
								<Button variant="primary">
									<Users size={16} className="me-2" />
									Add User
								</Button>
							</div>

							{/* Search and Filter */}
							<div className="row g-3 mb-4">
								<div className="col-md-6">
									<div className="input-group">
										<span className="input-group-text">
											<Search size={16} />
										</span>
										<Input
											placeholder="Search users..."
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
										/>
									</div>
								</div>
								<div className="col-md-3">
									<select
										className="form-select"
										value={filterStatus}
										onChange={(e) =>
											setFilterStatus(e.target.value)
										}
									>
										<option value="all">All Status</option>
										<option value="active">Active</option>
										<option value="suspended">
											Suspended
										</option>
										<option value="locked">Locked</option>
										<option value="pending">Pending</option>
									</select>
								</div>
								<div className="col-md-3">
									<Button variant="outline" className="w-100">
										<Filter size={16} className="me-2" />
										More Filters
									</Button>
								</div>
							</div>

							{/* Users Table */}
							<div className="table-responsive">
								<table className="table table-hover">
									<thead>
										<tr>
											<th>User</th>
											<th>Status</th>
											<th>Role</th>
											<th>Accounts</th>
											<th>Total Balance</th>
											<th>Risk Level</th>
											<th>Last Login</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredUsers.map((user) => (
											<tr key={user.id}>
												<td>
													<div>
														<div className="fw-medium">
															{user.name}
														</div>
														<small className="text-muted">
															{user.email}
														</small>
													</div>
												</td>
												<td>
													{getStatusBadge(
														user.status
													)}
												</td>
												<td>
													<span className="text-capitalize">
														{user.role.replace(
															"_",
															" "
														)}
													</span>
												</td>
												<td>{user.accounts}</td>
												<td>
													{formatCurrency(
														user.totalBalance
													)}
												</td>
												<td>
													{getRiskBadge(
														user.riskLevel
													)}
												</td>
												<td>
													<small className="text-muted">
														{user.lastLogin}
													</small>
												</td>
												<td>
													<div className="dropdown">
														<button
															className="btn btn-outline-secondary btn-sm"
															data-bs-toggle="dropdown"
														>
															<MoreVertical
																size={14}
															/>
														</button>
														<ul className="dropdown-menu">
															<li>
																<button
																	className="dropdown-item"
																	onClick={() =>
																		handleUserAction(
																			"View",
																			user.id
																		)
																	}
																>
																	<Eye
																		size={
																			14
																		}
																		className="me-2"
																	/>
																	View Details
																</button>
															</li>
															<li>
																<button
																	className="dropdown-item"
																	onClick={() =>
																		handleUserAction(
																			"Edit",
																			user.id
																		)
																	}
																>
																	<Settings
																		size={
																			14
																		}
																		className="me-2"
																	/>
																	Edit User
																</button>
															</li>
															<li>
																<hr className="dropdown-divider" />
															</li>
															<li>
																<button
																	className="dropdown-item"
																	onClick={() =>
																		handleUserAction(
																			user.status ===
																				"active"
																				? "Suspend"
																				: "Activate",
																			user.id
																		)
																	}
																>
																	{user.status ===
																	"active" ? (
																		<>
																			<Lock
																				size={
																					14
																				}
																				className="me-2"
																			/>
																			Suspend
																		</>
																	) : (
																		<>
																			<Unlock
																				size={
																					14
																				}
																				className="me-2"
																			/>
																			Activate
																		</>
																	)}
																</button>
															</li>
														</ul>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</Card>
					</div>
				</>
			)}

			{/* Activity Log Tab */}
			{activeTab === "activity" && (
				<div className="col-12">
					<Card>
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h5 className="fw-medium mb-0">
								System Activity Log
							</h5>
							<Button variant="outline">
								<FileText size={16} className="me-2" />
								Export Log
							</Button>
						</div>

						<div className="list-group list-group-flush">
							{recentActivity.map((activity, index) => (
								<div
									key={activity.id}
									className={`list-group-item d-flex align-items-start py-3 ${
										index === recentActivity.length - 1
											? "border-bottom-0"
											: ""
									}`}
								>
									{getSeverityIcon(activity.severity)}
									<div className="flex-grow-1">
										<p className="mb-1">
											{activity.description}
										</p>
										<small className="text-muted">
											{activity.timestamp}
										</small>
									</div>
									<span
										className={`badge ms-2 ${
											activity.severity === "success"
												? "bg-success"
												: activity.severity ===
												  "warning"
												? "bg-warning"
												: activity.severity === "error"
												? "bg-danger"
												: "bg-info"
										}`}
									>
										{activity.type.replace("_", " ")}
									</span>
								</div>
							))}
						</div>
					</Card>
				</div>
			)}

			{/* System Health Tab */}
			{activeTab === "system" && (
				<div className="col-12">
					<div className="row g-4">
						<div className="col-lg-6">
							<Card>
								<h5 className="fw-medium mb-4">
									Server Status
								</h5>
								<div className="list-group list-group-flush">
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<span>Web Server</span>
										<span className="badge bg-success">
											Online
										</span>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<span>Database Server</span>
										<span className="badge bg-success">
											Online
										</span>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<span>Cache Server</span>
										<span className="badge bg-success">
											Online
										</span>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
										<span>Backup Server</span>
										<span className="badge bg-success">
											Online
										</span>
									</div>
								</div>
							</Card>
						</div>
						<div className="col-lg-6">
							<Card>
								<h5 className="fw-medium mb-4">
									Performance Metrics
								</h5>
								<div className="list-group list-group-flush">
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<span>CPU Usage</span>
										<span>45%</span>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<span>Memory Usage</span>
										<span>62%</span>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<span>Disk Usage</span>
										<span>78%</span>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
										<span>Network Load</span>
										<span>23%</span>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminPanel;
