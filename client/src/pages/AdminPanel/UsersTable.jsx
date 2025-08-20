import {
	Eye,
	Settings,
	Lock,
	Unlock,
	Check,
	X,
	UserCheck,
	UserX,
	Edit,
} from "lucide-react";
import {
	formatCurrency,
	getStatusBadge,
	getRiskBadge,
	formatDateTime,
} from "./adminUtils";

const UserActionButtons = ({
	user,
	onUserAction,
	onEditUser,
	onDeleteUser,
	onViewUser,
}) => {
	const handleAction = (action) => {
		if (action === "view") {
			// Handle view action - could show a modal or navigate
			if (onViewUser) {
				onViewUser(user);
			} else {
				console.log("Viewing user details for:", user);
				alert(
					`Viewing details for user: ${user.username} (${user.email})`
				);
			}
			return;
		}

		if (action === "edit") {
			// Handle edit action - could open an edit modal
			if (onEditUser) {
				onEditUser(user);
			} else {
				console.log("Editing user:", user);
				alert(`Edit user functionality for: ${user.username}`);
			}
			return;
		}

		if (action === "delete") {
			// Handle delete action
			if (onDeleteUser) {
				onDeleteUser(user.id, user.username);
			} else {
				if (
					window.confirm(
						`Are you sure you want to delete user ${user.username}? This action cannot be undone.`
					)
				) {
					alert("Delete user functionality not yet implemented");
				}
			}
			return;
		}

		if (action === "suspend" || action === "reject") {
			const reason = window.prompt(
				`Please provide a reason for ${action}ing this user:`
			);
			if (reason !== null) {
				onUserAction(action, user.id, reason);
			}
		} else {
			onUserAction(action, user.id);
		}
	};

	return (
		<div className="btn-group" role="group" aria-label="User actions">
			{/* View Button - Always Available */}
			<button
				className="btn btn-outline-info btn-sm"
				onClick={() => handleAction("view")}
				title="View Details"
			>
				<Eye size={14} />
			</button>

			{/* Status-based Action Buttons */}
			{user.approval_status === "pending" && (
				<>
					<button
						className="btn btn-outline-success btn-sm"
						onClick={() => handleAction("approve")}
						title="Approve User"
					>
						<Check size={14} />
					</button>
					<button
						className="btn btn-outline-danger btn-sm"
						onClick={() => handleAction("reject")}
						title="Reject User"
					>
						<X size={14} />
					</button>
				</>
			)}

			{user.approval_status === "approved" && (
				<>
					{user.is_active ? (
						<>
							<button
								className="btn btn-outline-warning btn-sm"
								onClick={() => handleAction("suspend")}
								title="Suspend User"
							>
								<Lock size={14} />
							</button>
							<button
								className="btn btn-outline-secondary btn-sm"
								onClick={() => handleAction("deactivate")}
								title="Deactivate User"
							>
								<UserX size={14} />
							</button>
						</>
					) : (
						<button
							className="btn btn-outline-success btn-sm"
							onClick={() => handleAction("activate")}
							title="Activate User"
						>
							<UserCheck size={14} />
						</button>
					)}
				</>
			)}

			{/* Edit Button - Always Available for approved users */}
			{user.approval_status === "approved" && (
				<button
					className="btn btn-outline-primary btn-sm"
					onClick={() => handleAction("edit")}
					title="Edit User"
				>
					<Edit size={14} />
				</button>
			)}
		</div>
	);
};

const UsersTable = ({
	users,
	onUserAction,
	onViewUser,
	onEditUser,
	onDeleteUser,
}) => {
	const getDisplayStatus = (user) => {
		if (user.approval_status === "pending") {
			return { class: "bg-warning", text: "Pending Approval" };
		}
		if (user.approval_status === "rejected") {
			return { class: "bg-danger", text: "Rejected" };
		}
		return user.is_active
			? { class: "bg-success", text: "Active" }
			: { class: "bg-secondary", text: "Inactive" };
	};

	const formatRole = (role) => {
		return role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	};

	const formatLastLogin = (lastLogin) => {
		if (!lastLogin) return "Never";
		try {
			return formatDateTime(lastLogin);
		} catch {
			return lastLogin;
		}
	};

	return (
		<div className="table-responsive">
			<table className="table table-hover">
				<thead>
					<tr>
						<th>User</th>
						<th>Status</th>
						<th>Role</th>
						<th>Branch</th>
						<th>Accounts</th>
						<th>Total Balance</th>
						<th>Last Login</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => {
						const statusInfo = getDisplayStatus(user);

						return (
							<tr key={user.id}>
								<td>
									<div>
										<div className="fw-medium">
											{user.first_name} {user.last_name}
										</div>
										<small className="text-muted">
											{user.email}
										</small>
										{user.username && (
											<small className="d-block text-muted">
												@{user.username}
											</small>
										)}
									</div>
								</td>
								<td>
									<span
										className={`badge ${statusInfo.class}`}
									>
										{statusInfo.text}
									</span>
								</td>
								<td>
									<span className="text-capitalize">
										{formatRole(user.role)}
									</span>
								</td>
								<td>
									{user.branch ? (
										<div>
											<div className="fw-medium">
												{user.branch.branch_name}
											</div>
											<small className="text-muted">
												{user.branch.city}
											</small>
										</div>
									) : (
										<span className="text-muted">
											No branch
										</span>
									)}
								</td>
								<td>
									<span className="badge bg-secondary">
										{user.accountsCount || 0}
									</span>
								</td>
								<td>
									{user.totalBalance > 0 ? (
										formatCurrency(user.totalBalance)
									) : (
										<span className="text-muted">
											$0.00
										</span>
									)}
								</td>
								<td>
									<small className="text-muted">
										{formatLastLogin(user.last_login)}
									</small>
								</td>
								<td>
									<UserActionButtons
										user={user}
										onUserAction={onUserAction}
										onViewUser={onViewUser}
										onEditUser={onEditUser}
										onDeleteUser={onDeleteUser}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{users.length === 0 && (
				<div className="text-center py-4">
					<p className="text-muted">
						No users found matching your search criteria.
					</p>
				</div>
			)}
		</div>
	);
};

export default UsersTable;
