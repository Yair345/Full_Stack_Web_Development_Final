import { useState, useEffect } from "react";
import {
	Building,
	Users,
	DollarSign,
	FileText,
	CheckCircle,
	XCircle,
	Clock,
	TrendingUp,
	Calendar,
	MapPin,
	Phone,
	Mail,
	Search,
	Filter,
	MoreVertical,
	Eye,
	Edit3,
	UserCheck,
	AlertCircle,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const BranchManagement = () => {
	const [branchCustomers, setBranchCustomers] = useState([]);
	const [loanApplications, setLoanApplications] = useState([]);
	const [branchStats, setBranchStats] = useState({});
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");

	// Mock data for branch management
	const mockBranchStats = {
		totalCustomers: 1247,
		newCustomersThisMonth: 23,
		totalAccounts: 2156,
		totalDeposits: 45672341.25,
		pendingApplications: 12,
		monthlyTransactions: 8934,
		branchRevenue: 156789.5,
		customerSatisfaction: 4.7,
	};

	const mockBranchCustomers = [
		{
			id: 1,
			name: "John Smith",
			email: "john.smith@email.com",
			phone: "+1 (555) 123-4567",
			accountNumber: "ACC-001234",
			accountType: "Premium",
			balance: 45650.75,
			joinDate: "2023-05-15",
			lastVisit: "2025-08-12",
			status: "active",
			riskScore: 2,
		},
		{
			id: 2,
			name: "Maria Garcia",
			email: "maria.garcia@email.com",
			phone: "+1 (555) 234-5678",
			accountNumber: "ACC-002345",
			accountType: "Standard",
			balance: 12300.5,
			joinDate: "2024-01-10",
			lastVisit: "2025-08-14",
			status: "active",
			riskScore: 1,
		},
		{
			id: 3,
			name: "Robert Johnson",
			email: "robert.j@email.com",
			phone: "+1 (555) 345-6789",
			accountNumber: "ACC-003456",
			accountType: "Business",
			balance: 125000.0,
			joinDate: "2022-03-20",
			lastVisit: "2025-08-15",
			status: "vip",
			riskScore: 1,
		},
		{
			id: 4,
			name: "Emily Davis",
			email: "emily.davis@email.com",
			phone: "+1 (555) 456-7890",
			accountNumber: "ACC-004567",
			accountType: "Standard",
			balance: 8750.25,
			joinDate: "2024-07-08",
			lastVisit: "2025-08-10",
			status: "active",
			riskScore: 3,
		},
		{
			id: 5,
			name: "Michael Brown",
			email: "michael.b@email.com",
			phone: "+1 (555) 567-8901",
			accountNumber: "ACC-005678",
			accountType: "Premium",
			balance: 67890.3,
			joinDate: "2023-11-15",
			lastVisit: "2025-08-13",
			status: "active",
			riskScore: 2,
		},
	];

	const mockLoanApplications = [
		{
			id: 1,
			customerName: "Sarah Wilson",
			email: "sarah.w@email.com",
			loanType: "Personal Loan",
			requestedAmount: 25000,
			purpose: "Home Improvement",
			creditScore: 720,
			monthlyIncome: 6500,
			status: "pending_review",
			submittedDate: "2025-08-10",
			priority: "medium",
		},
		{
			id: 2,
			customerName: "David Miller",
			email: "david.m@email.com",
			loanType: "Auto Loan",
			requestedAmount: 35000,
			purpose: "Vehicle Purchase",
			creditScore: 680,
			monthlyIncome: 5200,
			status: "pending_approval",
			submittedDate: "2025-08-08",
			priority: "low",
		},
		{
			id: 3,
			customerName: "Jennifer Taylor",
			email: "jennifer.t@email.com",
			loanType: "Mortgage",
			requestedAmount: 450000,
			purpose: "Home Purchase",
			creditScore: 780,
			monthlyIncome: 12000,
			status: "under_review",
			submittedDate: "2025-08-05",
			priority: "high",
		},
		{
			id: 4,
			customerName: "Thomas Anderson",
			email: "thomas.a@email.com",
			loanType: "Business Loan",
			requestedAmount: 75000,
			purpose: "Business Expansion",
			creditScore: 740,
			monthlyIncome: 8500,
			status: "documentation_required",
			submittedDate: "2025-08-12",
			priority: "high",
		},
	];

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setBranchCustomers(mockBranchCustomers);
				setLoanApplications(mockLoanApplications);
				setBranchStats(mockBranchStats);
			} catch (err) {
				console.error("Error loading branch data:", err);
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
			vip: { class: "bg-warning", text: "VIP" },
			inactive: { class: "bg-secondary", text: "Inactive" },
			pending_review: { class: "bg-info", text: "Pending Review" },
			pending_approval: { class: "bg-warning", text: "Pending Approval" },
			under_review: { class: "bg-primary", text: "Under Review" },
			documentation_required: {
				class: "bg-danger",
				text: "Docs Required",
			},
			approved: { class: "bg-success", text: "Approved" },
			rejected: { class: "bg-danger", text: "Rejected" },
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

	const getPriorityBadge = (priority) => {
		const priorityMap = {
			high: { class: "bg-danger", text: "High" },
			medium: { class: "bg-warning", text: "Medium" },
			low: { class: "bg-success", text: "Low" },
		};
		const priorityInfo = priorityMap[priority] || {
			class: "bg-secondary",
			text: "Unknown",
		};
		return (
			<span className={`badge ${priorityInfo.class}`}>
				{priorityInfo.text}
			</span>
		);
	};

	const getRiskScore = (score) => {
		const riskMap = {
			1: { class: "text-success", text: "Low Risk" },
			2: { class: "text-warning", text: "Medium Risk" },
			3: { class: "text-danger", text: "High Risk" },
		};
		const riskInfo = riskMap[score] || {
			class: "text-secondary",
			text: "Unknown",
		};
		return <span className={riskInfo.class}>{riskInfo.text}</span>;
	};

	const handleCustomerAction = (action, customerId) => {
		console.log(`${action} customer:`, customerId);
		alert(`${action} customer action will be implemented soon!`);
	};

	const handleLoanAction = (action, applicationId) => {
		console.log(`${action} loan application:`, applicationId);
		alert(`${action} loan application will be implemented soon!`);
	};

	const filteredCustomers = branchCustomers.filter((customer) => {
		const matchesSearch =
			customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.accountNumber
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
		const matchesFilter =
			filterStatus === "all" || customer.status === filterStatus;
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
							Branch Management
						</h1>
						<p className="text-muted mb-0">
							<Building size={16} className="me-1" />
							Downtown Branch - Manager Dashboard
						</p>
					</div>
					<div className="d-flex gap-2">
						<Button variant="outline">
							<FileText size={16} className="me-2" />
							Branch Report
						</Button>
						<Button variant="primary">
							<Calendar size={16} className="me-2" />
							Schedule Meeting
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
							<TrendingUp size={16} className="me-2" />
							Overview
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "customers" ? "active" : ""
							}`}
							onClick={() => setActiveTab("customers")}
						>
							<Users size={16} className="me-2" />
							Customers
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "loans" ? "active" : ""
							}`}
							onClick={() => setActiveTab("loans")}
						>
							<FileText size={16} className="me-2" />
							Loan Applications
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "reports" ? "active" : ""
							}`}
							onClick={() => setActiveTab("reports")}
						>
							<Building size={16} className="me-2" />
							Branch Reports
						</button>
					</li>
				</ul>
			</div>

			{/* Overview Tab */}
			{activeTab === "overview" && (
				<>
					{/* Branch Stats */}
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
												Total Customers
											</p>
											<p className="h5 fw-bold mb-0">
												{branchStats.totalCustomers?.toLocaleString()}
											</p>
											<small className="text-success">
												+
												{
													branchStats.newCustomersThisMonth
												}{" "}
												this month
											</small>
										</div>
									</div>
								</Card>
							</div>
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-success bg-opacity-10 rounded p-2 me-3">
											<DollarSign
												size={24}
												className="text-success"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Total Deposits
											</p>
											<p className="h5 fw-bold mb-0">
												{formatCurrency(
													branchStats.totalDeposits
												)}
											</p>
											<small className="text-muted">
												{branchStats.totalAccounts}{" "}
												accounts
											</small>
										</div>
									</div>
								</Card>
							</div>
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-warning bg-opacity-10 rounded p-2 me-3">
											<FileText
												size={24}
												className="text-warning"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Pending Applications
											</p>
											<p className="h5 fw-bold mb-0">
												{
													branchStats.pendingApplications
												}
											</p>
											<small className="text-muted">
												Require attention
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
												Monthly Revenue
											</p>
											<p className="h5 fw-bold mb-0">
												{formatCurrency(
													branchStats.branchRevenue
												)}
											</p>
											<small className="text-success">
												↑ 12% vs last month
											</small>
										</div>
									</div>
								</Card>
							</div>
						</div>
					</div>

					{/* Performance Metrics */}
					<div className="col-lg-8">
						<Card>
							<h5 className="fw-medium mb-4">
								Branch Performance
							</h5>
							<div className="row g-4">
								<div className="col-md-6">
									<div className="text-center">
										<div
											className="bg-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
											style={{
												width: "80px",
												height: "80px",
											}}
										>
											<span className="h4 fw-bold text-white mb-0">
												{
													branchStats.customerSatisfaction
												}
											</span>
										</div>
										<h6 className="fw-medium">
											Customer Satisfaction
										</h6>
										<small className="text-muted">
											Average rating (out of 5)
										</small>
									</div>
								</div>
								<div className="col-md-6">
									<div className="list-group list-group-flush">
										<div className="list-group-item d-flex justify-content-between align-items-center px-0">
											<span>Monthly Transactions</span>
											<span className="fw-bold">
												{branchStats.monthlyTransactions?.toLocaleString()}
											</span>
										</div>
										<div className="list-group-item d-flex justify-content-between align-items-center px-0">
											<span>New Accounts</span>
											<span className="fw-bold text-success">
												+
												{
													branchStats.newCustomersThisMonth
												}
											</span>
										</div>
										<div className="list-group-item d-flex justify-content-between align-items-center px-0">
											<span>Loan Applications</span>
											<span className="fw-bold text-warning">
												{
													branchStats.pendingApplications
												}
											</span>
										</div>
										<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
											<span>Revenue Growth</span>
											<span className="fw-bold text-success">
												+12%
											</span>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>

					<div className="col-lg-4">
						<Card>
							<h6 className="fw-medium mb-3">Quick Actions</h6>
							<div className="d-grid gap-2 mb-3">
								<Button variant="outline" size="sm">
									<Users size={14} className="me-2" />
									Add New Customer
								</Button>
								<Button variant="outline" size="sm">
									<FileText size={14} className="me-2" />
									Review Applications
								</Button>
								<Button variant="outline" size="sm">
									<Calendar size={14} className="me-2" />
									Schedule Appointments
								</Button>
								<Button variant="outline" size="sm">
									<Building size={14} className="me-2" />
									Branch Settings
								</Button>
							</div>
						</Card>

						<Card>
							<h6 className="fw-medium mb-3">
								Branch Information
							</h6>
							<div className="small">
								<div className="d-flex align-items-center mb-2">
									<MapPin
										size={14}
										className="me-2 text-muted"
									/>
									<span>
										123 Downtown Ave, City, ST 12345
									</span>
								</div>
								<div className="d-flex align-items-center mb-2">
									<Phone
										size={14}
										className="me-2 text-muted"
									/>
									<span>+1 (555) 123-BANK</span>
								</div>
								<div className="d-flex align-items-center mb-2">
									<Mail
										size={14}
										className="me-2 text-muted"
									/>
									<span>downtown@bank.com</span>
								</div>
								<div className="d-flex align-items-center">
									<Clock
										size={14}
										className="me-2 text-muted"
									/>
									<span>Mon-Fri: 9AM-5PM</span>
								</div>
							</div>
						</Card>
					</div>
				</>
			)}

			{/* Customers Tab */}
			{activeTab === "customers" && (
				<>
					<div className="col-12">
						<Card>
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h5 className="fw-medium mb-0">
									Branch Customers
								</h5>
								<Button variant="primary">
									<Users size={16} className="me-2" />
									Add Customer
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
											placeholder="Search customers..."
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
										<option value="all">
											All Customers
										</option>
										<option value="active">Active</option>
										<option value="vip">VIP</option>
										<option value="inactive">
											Inactive
										</option>
									</select>
								</div>
								<div className="col-md-3">
									<Button variant="outline" className="w-100">
										<Filter size={16} className="me-2" />
										Advanced Filter
									</Button>
								</div>
							</div>

							{/* Customers Table */}
							<div className="table-responsive">
								<table className="table table-hover">
									<thead>
										<tr>
											<th>Customer</th>
											<th>Account</th>
											<th>Balance</th>
											<th>Status</th>
											<th>Risk Score</th>
											<th>Last Visit</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredCustomers.map((customer) => (
											<tr key={customer.id}>
												<td>
													<div>
														<div className="fw-medium">
															{customer.name}
														</div>
														<small className="text-muted">
															{customer.email}
														</small>
													</div>
												</td>
												<td>
													<div>
														<div className="fw-medium">
															{
																customer.accountNumber
															}
														</div>
														<small className="text-muted">
															{
																customer.accountType
															}
														</small>
													</div>
												</td>
												<td>
													{formatCurrency(
														customer.balance
													)}
												</td>
												<td>
													{getStatusBadge(
														customer.status
													)}
												</td>
												<td>
													{getRiskScore(
														customer.riskScore
													)}
												</td>
												<td>
													<small className="text-muted">
														{customer.lastVisit}
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
																		handleCustomerAction(
																			"View",
																			customer.id
																		)
																	}
																>
																	<Eye
																		size={
																			14
																		}
																		className="me-2"
																	/>
																	View Profile
																</button>
															</li>
															<li>
																<button
																	className="dropdown-item"
																	onClick={() =>
																		handleCustomerAction(
																			"Edit",
																			customer.id
																		)
																	}
																>
																	<Edit3
																		size={
																			14
																		}
																		className="me-2"
																	/>
																	Edit Details
																</button>
															</li>
															<li>
																<button
																	className="dropdown-item"
																	onClick={() =>
																		handleCustomerAction(
																			"Contact",
																			customer.id
																		)
																	}
																>
																	<Phone
																		size={
																			14
																		}
																		className="me-2"
																	/>
																	Contact
																	Customer
																</button>
															</li>
															<li>
																<hr className="dropdown-divider" />
															</li>
															<li>
																<button
																	className="dropdown-item"
																	onClick={() =>
																		handleCustomerAction(
																			"Account History",
																			customer.id
																		)
																	}
																>
																	<FileText
																		size={
																			14
																		}
																		className="me-2"
																	/>
																	Account
																	History
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

			{/* Loan Applications Tab */}
			{activeTab === "loans" && (
				<div className="col-12">
					<Card>
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h5 className="fw-medium mb-0">
								Loan Applications
							</h5>
							<div className="d-flex gap-2">
								<Button variant="outline">
									<Filter size={16} className="me-2" />
									Filter
								</Button>
								<Button variant="primary">
									<FileText size={16} className="me-2" />
									New Application
								</Button>
							</div>
						</div>

						<div className="row g-4">
							{loanApplications.map((application) => (
								<div key={application.id} className="col-lg-6">
									<div className="border rounded p-4">
										<div className="d-flex justify-content-between align-items-start mb-3">
											<div>
												<h6 className="fw-medium mb-1">
													{application.customerName}
												</h6>
												<small className="text-muted">
													{application.email}
												</small>
											</div>
											<div className="d-flex gap-2">
												{getPriorityBadge(
													application.priority
												)}
												{getStatusBadge(
													application.status
												)}
											</div>
										</div>

										<div className="row g-2 mb-3 small">
											<div className="col-6">
												<span className="text-muted">
													Loan Type:
												</span>
											</div>
											<div className="col-6">
												<span className="fw-medium">
													{application.loanType}
												</span>
											</div>
											<div className="col-6">
												<span className="text-muted">
													Amount:
												</span>
											</div>
											<div className="col-6">
												<span className="fw-medium">
													{formatCurrency(
														application.requestedAmount
													)}
												</span>
											</div>
											<div className="col-6">
												<span className="text-muted">
													Credit Score:
												</span>
											</div>
											<div className="col-6">
												<span className="fw-medium">
													{application.creditScore}
												</span>
											</div>
											<div className="col-6">
												<span className="text-muted">
													Income:
												</span>
											</div>
											<div className="col-6">
												<span className="fw-medium">
													{formatCurrency(
														application.monthlyIncome
													)}
													/mo
												</span>
											</div>
											<div className="col-6">
												<span className="text-muted">
													Purpose:
												</span>
											</div>
											<div className="col-6">
												<span className="fw-medium">
													{application.purpose}
												</span>
											</div>
											<div className="col-6">
												<span className="text-muted">
													Submitted:
												</span>
											</div>
											<div className="col-6">
												<span className="fw-medium">
													{application.submittedDate}
												</span>
											</div>
										</div>

										<div className="d-flex gap-2">
											<Button
												variant="success"
												size="sm"
												onClick={() =>
													handleLoanAction(
														"Approve",
														application.id
													)
												}
											>
												<CheckCircle
													size={14}
													className="me-1"
												/>
												Approve
											</Button>
											<Button
												variant="danger"
												size="sm"
												onClick={() =>
													handleLoanAction(
														"Reject",
														application.id
													)
												}
											>
												<XCircle
													size={14}
													className="me-1"
												/>
												Reject
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleLoanAction(
														"Review",
														application.id
													)
												}
											>
												<Eye
													size={14}
													className="me-1"
												/>
												Review
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</Card>
				</div>
			)}

			{/* Reports Tab */}
			{activeTab === "reports" && (
				<div className="col-12">
					<div className="row g-4">
						<div className="col-lg-6">
							<Card>
								<h5 className="fw-medium mb-4">
									Generate Reports
								</h5>
								<div className="d-grid gap-3">
									<Button
										variant="outline"
										className="text-start"
									>
										<div className="d-flex align-items-center">
											<FileText
												size={20}
												className="me-3"
											/>
											<div>
												<div className="fw-medium">
													Monthly Branch Report
												</div>
												<small className="text-muted">
													Customer activity and
													performance metrics
												</small>
											</div>
										</div>
									</Button>
									<Button
										variant="outline"
										className="text-start"
									>
										<div className="d-flex align-items-center">
											<Users size={20} className="me-3" />
											<div>
												<div className="fw-medium">
													Customer Demographics
												</div>
												<small className="text-muted">
													Age, location, and account
													type breakdown
												</small>
											</div>
										</div>
									</Button>
									<Button
										variant="outline"
										className="text-start"
									>
										<div className="d-flex align-items-center">
											<DollarSign
												size={20}
												className="me-3"
											/>
											<div>
												<div className="fw-medium">
													Revenue Analysis
												</div>
												<small className="text-muted">
													Fee income and product
													performance
												</small>
											</div>
										</div>
									</Button>
									<Button
										variant="outline"
										className="text-start"
									>
										<div className="d-flex align-items-center">
											<TrendingUp
												size={20}
												className="me-3"
											/>
											<div>
												<div className="fw-medium">
													Growth Trends
												</div>
												<small className="text-muted">
													Customer acquisition and
													retention rates
												</small>
											</div>
										</div>
									</Button>
								</div>
							</Card>
						</div>

						<div className="col-lg-6">
							<Card>
								<h5 className="fw-medium mb-4">
									Recent Reports
								</h5>
								<div className="list-group list-group-flush">
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<div>
											<div className="fw-medium">
												July 2025 Branch Report
											</div>
											<small className="text-muted">
												Generated on Aug 1, 2025
											</small>
										</div>
										<Button variant="outline" size="sm">
											Download
										</Button>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<div>
											<div className="fw-medium">
												Q2 Customer Analysis
											</div>
											<small className="text-muted">
												Generated on Jul 15, 2025
											</small>
										</div>
										<Button variant="outline" size="sm">
											Download
										</Button>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0">
										<div>
											<div className="fw-medium">
												Loan Portfolio Review
											</div>
											<small className="text-muted">
												Generated on Jul 1, 2025
											</small>
										</div>
										<Button variant="outline" size="sm">
											Download
										</Button>
									</div>
									<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
										<div>
											<div className="fw-medium">
												Risk Assessment Report
											</div>
											<small className="text-muted">
												Generated on Jun 15, 2025
											</small>
										</div>
										<Button variant="outline" size="sm">
											Download
										</Button>
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

export default BranchManagement;
