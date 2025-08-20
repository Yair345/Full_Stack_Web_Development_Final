import { useState } from "react";
import { Search, Filter, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import UsersTable from "./UsersTable";

const UserManagementTab = ({
	users,
	onAddUser,
	onUserAction,
	onViewUser,
	onEditUser,
	onDeleteUser,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [filterRole, setFilterRole] = useState("all");

	const filteredUsers = users.filter((user) => {
		// Search filter
		const matchesSearch =
			!searchTerm ||
			user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.username?.toLowerCase().includes(searchTerm.toLowerCase());

		// Status filter
		let matchesStatus = filterStatus === "all";
		if (filterStatus === "active") {
			matchesStatus =
				user.is_active && user.approval_status === "approved";
		} else if (filterStatus === "inactive") {
			matchesStatus =
				!user.is_active && user.approval_status === "approved";
		} else if (filterStatus === "pending") {
			matchesStatus = user.approval_status === "pending";
		} else if (filterStatus === "rejected") {
			matchesStatus = user.approval_status === "rejected";
		}

		// Role filter
		const matchesRole = filterRole === "all" || user.role === filterRole;

		return matchesSearch && matchesStatus && matchesRole;
	});

	const getUserStats = () => {
		const total = users.length;
		const active = users.filter(
			(u) => u.is_active && u.approval_status === "approved"
		).length;
		const pending = users.filter(
			(u) => u.approval_status === "pending"
		).length;
		const rejected = users.filter(
			(u) => u.approval_status === "rejected"
		).length;
		const inactive = users.filter(
			(u) => !u.is_active && u.approval_status === "approved"
		).length;

		return { total, active, pending, rejected, inactive };
	};

	const stats = getUserStats();

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h5 className="fw-medium mb-0">User Management</h5>
					<Button variant="primary" onClick={onAddUser}>
						<Users size={16} className="me-2" />
						Add User
					</Button>
				</div>

				{/* User Statistics */}
				<div className="row mb-4">
					<div className="col-md-2">
						<div className="card bg-primary text-white">
							<div className="card-body text-center">
								<h4 className="card-title">{stats.total}</h4>
								<p className="card-text mb-0">Total</p>
							</div>
						</div>
					</div>
					<div className="col-md-2">
						<div className="card bg-success text-white">
							<div className="card-body text-center">
								<h4 className="card-title">{stats.active}</h4>
								<p className="card-text mb-0">Active</p>
							</div>
						</div>
					</div>
					<div className="col-md-2">
						<div className="card bg-warning text-white">
							<div className="card-body text-center">
								<h4 className="card-title">{stats.pending}</h4>
								<p className="card-text mb-0">Pending</p>
							</div>
						</div>
					</div>
					<div className="col-md-2">
						<div className="card bg-danger text-white">
							<div className="card-body text-center">
								<h4 className="card-title">{stats.rejected}</h4>
								<p className="card-text mb-0">Rejected</p>
							</div>
						</div>
					</div>
					<div className="col-md-2">
						<div className="card bg-secondary text-white">
							<div className="card-body text-center">
								<h4 className="card-title">{stats.inactive}</h4>
								<p className="card-text mb-0">Inactive</p>
							</div>
						</div>
					</div>
				</div>

				{/* Search and Filter */}
				<div className="row g-3 mb-4">
					<div className="col-md-4">
						<div className="input-group">
							<span className="input-group-text">
								<Search size={16} />
							</span>
							<Input
								placeholder="Search users..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<div className="col-md-3">
						<select
							className="form-select"
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
						>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="pending">Pending Approval</option>
							<option value="rejected">Rejected</option>
						</select>
					</div>
					<div className="col-md-3">
						<select
							className="form-select"
							value={filterRole}
							onChange={(e) => setFilterRole(e.target.value)}
						>
							<option value="all">All Roles</option>
							<option value="customer">Customer</option>
							<option value="manager">Manager</option>
							<option value="admin">Admin</option>
						</select>
					</div>
					<div className="col-md-2">
						<div className="text-muted small">
							Showing {filteredUsers.length} of {users.length}{" "}
							users
						</div>
					</div>
				</div>

				<UsersTable
					users={filteredUsers}
					onUserAction={onUserAction}
					onViewUser={onViewUser}
					onEditUser={onEditUser}
					onDeleteUser={onDeleteUser}
				/>
			</Card>
		</div>
	);
};

export default UserManagementTab;
