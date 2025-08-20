import {
	X,
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	CreditCard,
	Building,
} from "lucide-react";

const ViewUserModal = ({ user, onClose }) => {
	if (!user) return null;

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusBadge = (status) => {
		const statusConfig = {
			pending: {
				class: "bg-warning text-dark",
				label: "Pending Approval",
			},
			approved: { class: "bg-success text-white", label: "Approved" },
			rejected: { class: "bg-danger text-white", label: "Rejected" },
		};
		const config = statusConfig[status] || {
			class: "bg-secondary text-white",
			label: status,
		};
		return <span className={`badge ${config.class}`}>{config.label}</span>;
	};

	const getRoleBadge = (role) => {
		const roleConfig = {
			admin: { class: "bg-danger text-white", label: "Administrator" },
			manager: { class: "bg-primary text-white", label: "Manager" },
			customer: { class: "bg-info text-white", label: "Customer" },
		};
		const config = roleConfig[role] || {
			class: "bg-secondary text-white",
			label: role,
		};
		return <span className={`badge ${config.class}`}>{config.label}</span>;
	};

	return (
		<div
			className="modal show d-block"
			tabIndex="-1"
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
		>
			<div className="modal-dialog modal-lg modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">
							<User size={20} className="me-2" />
							User Details - {user.first_name} {user.last_name}
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							aria-label="Close"
						></button>
					</div>
					<div className="modal-body">
						<div className="row">
							{/* Basic Information */}
							<div className="col-md-6">
								<div className="card mb-3">
									<div className="card-header">
										<h6 className="card-title mb-0">
											<User size={16} className="me-2" />
											Basic Information
										</h6>
									</div>
									<div className="card-body">
										<div className="mb-2">
											<strong>Full Name:</strong>
											<div>
												{user.first_name}{" "}
												{user.last_name}
											</div>
										</div>
										<div className="mb-2">
											<strong>Username:</strong>
											<div>{user.username}</div>
										</div>
										<div className="mb-2">
											<strong>Email:</strong>
											<div>
												<Mail
													size={14}
													className="me-1"
												/>
												{user.email}
											</div>
										</div>
										<div className="mb-2">
											<strong>Phone:</strong>
											<div>
												<Phone
													size={14}
													className="me-1"
												/>
												{user.phone || "N/A"}
											</div>
										</div>
										<div className="mb-2">
											<strong>Date of Birth:</strong>
											<div>
												<Calendar
													size={14}
													className="me-1"
												/>
												{user.date_of_birth
													? new Date(
															user.date_of_birth
													  ).toLocaleDateString()
													: "N/A"}
											</div>
										</div>
										<div className="mb-2">
											<strong>National ID:</strong>
											<div>
												<CreditCard
													size={14}
													className="me-1"
												/>
												{user.national_id}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Status & Role Information */}
							<div className="col-md-6">
								<div className="card mb-3">
									<div className="card-header">
										<h6 className="card-title mb-0">
											<Building
												size={16}
												className="me-2"
											/>
											Status & Role
										</h6>
									</div>
									<div className="card-body">
										<div className="mb-2">
											<strong>Role:</strong>
											<div className="mt-1">
												{getRoleBadge(user.role)}
											</div>
										</div>
										<div className="mb-2">
											<strong>Approval Status:</strong>
											<div className="mt-1">
												{getStatusBadge(
													user.approval_status
												)}
											</div>
										</div>
										<div className="mb-2">
											<strong>Active Status:</strong>
											<div className="mt-1">
												<span
													className={`badge ${
														user.is_active
															? "bg-success"
															: "bg-secondary"
													} text-white`}
												>
													{user.is_active
														? "Active"
														: "Inactive"}
												</span>
											</div>
										</div>
										<div className="mb-2">
											<strong>Email Verified:</strong>
											<div className="mt-1">
												<span
													className={`badge ${
														user.is_verified
															? "bg-success"
															: "bg-warning text-dark"
													} text-white`}
												>
													{user.is_verified
														? "Verified"
														: "Unverified"}
												</span>
											</div>
										</div>
										<div className="mb-2">
											<strong>Branch:</strong>
											<div>
												{user.branchName ||
													"No Branch Assigned"}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Address Information */}
						<div className="card mb-3">
							<div className="card-header">
								<h6 className="card-title mb-0">
									<MapPin size={16} className="me-2" />
									Address Information
								</h6>
							</div>
							<div className="card-body">
								<div className="mb-2">
									<strong>Address:</strong>
									<div>
										{user.address || "No address provided"}
									</div>
								</div>
							</div>
						</div>

						{/* Account Information */}
						<div className="row">
							<div className="col-md-6">
								<div className="card">
									<div className="card-header">
										<h6 className="card-title mb-0">
											Account Statistics
										</h6>
									</div>
									<div className="card-body">
										<div className="mb-2">
											<strong>Total Accounts:</strong>
											<div className="text-primary fw-bold">
												{user.accountCount || 0}
											</div>
										</div>
										<div className="mb-2">
											<strong>Total Balance:</strong>
											<div className="text-success fw-bold">
												$
												{user.totalBalance
													? parseFloat(
															user.totalBalance
													  ).toLocaleString()
													: "0.00"}
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className="card">
									<div className="card-header">
										<h6 className="card-title mb-0">
											Account Dates
										</h6>
									</div>
									<div className="card-body">
										<div className="mb-2">
											<strong>Created:</strong>
											<div className="small text-muted">
												{formatDate(user.created_at)}
											</div>
										</div>
										<div className="mb-2">
											<strong>Last Login:</strong>
											<div className="small text-muted">
												{formatDate(user.last_login)}
											</div>
										</div>
										{user.approved_at && (
											<div className="mb-2">
												<strong>Approved:</strong>
												<div className="small text-muted">
													{formatDate(
														user.approved_at
													)}
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Rejection Reason */}
						{user.approval_status === "rejected" &&
							user.rejection_reason && (
								<div className="card mt-3">
									<div className="card-header bg-danger text-white">
										<h6 className="card-title mb-0">
											Rejection Reason
										</h6>
									</div>
									<div className="card-body">
										<p className="mb-0">
											{user.rejection_reason}
										</p>
									</div>
								</div>
							)}
					</div>
					<div className="modal-footer">
						<button
							type="button"
							className="btn btn-secondary"
							onClick={onClose}
						>
							<X size={16} className="me-1" />
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewUserModal;
