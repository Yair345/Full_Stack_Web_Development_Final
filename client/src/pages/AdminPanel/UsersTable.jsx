import { MoreVertical, Eye, Settings, Lock, Unlock } from "lucide-react";
import { formatCurrency, getStatusBadge, getRiskBadge } from "./adminUtils";

const UserActionDropdown = ({ user, onUserAction }) => {
	return (
		<div className="dropdown">
			<button
				className="btn btn-outline-secondary btn-sm"
				data-bs-toggle="dropdown"
				aria-expanded="false"
			>
				<MoreVertical size={14} />
			</button>
			<ul className="dropdown-menu">
				<li>
					<button
						className="dropdown-item"
						onClick={() => onUserAction("View", user.id)}
					>
						<Eye size={14} className="me-2" />
						View Details
					</button>
				</li>
				<li>
					<button
						className="dropdown-item"
						onClick={() => onUserAction("Edit", user.id)}
					>
						<Settings size={14} className="me-2" />
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
							onUserAction(
								user.status === "active"
									? "Suspend"
									: "Activate",
								user.id
							)
						}
					>
						{user.status === "active" ? (
							<>
								<Lock size={14} className="me-2" />
								Suspend
							</>
						) : (
							<>
								<Unlock size={14} className="me-2" />
								Activate
							</>
						)}
					</button>
				</li>
			</ul>
		</div>
	);
};

const UsersTable = ({ users, onUserAction }) => {
	return (
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
					{users.map((user) => {
						const statusInfo = getStatusBadge(user.status);
						const riskInfo = getRiskBadge(user.riskLevel);

						return (
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
									<span
										className={`badge ${statusInfo.class}`}
									>
										{statusInfo.text}
									</span>
								</td>
								<td>
									<span className="text-capitalize">
										{user.role.replace("_", " ")}
									</span>
								</td>
								<td>{user.accounts}</td>
								<td>{formatCurrency(user.totalBalance)}</td>
								<td>
									<span className={`badge ${riskInfo.class}`}>
										{riskInfo.text}
									</span>
								</td>
								<td>
									<small className="text-muted">
										{user.lastLogin}
									</small>
								</td>
								<td>
									<UserActionDropdown
										user={user}
										onUserAction={onUserAction}
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
