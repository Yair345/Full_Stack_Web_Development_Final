import { useState } from "react";
import {
	X,
	Save,
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	CreditCard,
	Building,
} from "lucide-react";

const EditUserModal = ({ user, onClose, onSave, canChangeRole = true }) => {
	const [formData, setFormData] = useState({
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		email: user?.email || "",
		phone: user?.phone || "",
		address: user?.address || "",
		role: user?.role || "customer",
		is_active: user?.is_active ?? true,
	});
	const [loading, setLoading] = useState(false);

	if (!user) return null;

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			await onSave(user.id, formData);
			onClose();
		} catch (error) {
			console.error("Error updating user:", error);
			// You might want to show an error message here
		} finally {
			setLoading(false);
		}
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
							Edit User - {user.first_name} {user.last_name}
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							aria-label="Close"
						></button>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="modal-body">
							<div className="row">
								{/* Basic Information */}
								<div className="col-md-6">
									<div className="card mb-3">
										<div className="card-header">
											<h6 className="card-title mb-0">
												<User
													size={16}
													className="me-2"
												/>
												Basic Information
											</h6>
										</div>
										<div className="card-body">
											<div className="mb-3">
												<label className="form-label">
													First Name{" "}
													<span className="text-danger">
														*
													</span>
												</label>
												<input
													type="text"
													className="form-control"
													name="first_name"
													value={formData.first_name}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													Last Name{" "}
													<span className="text-danger">
														*
													</span>
												</label>
												<input
													type="text"
													className="form-control"
													name="last_name"
													value={formData.last_name}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													<Mail
														size={14}
														className="me-1"
													/>
													Email{" "}
													<span className="text-danger">
														*
													</span>
												</label>
												<input
													type="email"
													className="form-control"
													name="email"
													value={formData.email}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													<Phone
														size={14}
														className="me-1"
													/>
													Phone
												</label>
												<input
													type="tel"
													className="form-control"
													name="phone"
													value={formData.phone}
													onChange={handleChange}
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Role & Status */}
								<div className="col-md-6">
									<div className="card mb-3">
										<div className="card-header">
											<h6 className="card-title mb-0">
												<Building
													size={16}
													className="me-2"
												/>
												Role & Status
											</h6>
										</div>
										<div className="card-body">
											{canChangeRole ? (
												<div className="mb-3">
													<label className="form-label">
														Role
													</label>
													<select
														className="form-select"
														name="role"
														value={formData.role}
														onChange={handleChange}
													>
														<option value="customer">
															Customer
														</option>
														<option value="manager">
															Manager
														</option>
														<option value="admin">
															Administrator
														</option>
													</select>
												</div>
											) : (
												<div className="mb-3">
													<label className="form-label">
														Role
													</label>
													<input
														type="text"
														className="form-control"
														value={
															formData.role
																.charAt(0)
																.toUpperCase() +
															formData.role.slice(
																1
															)
														}
														disabled
													/>
													<div className="form-text">
														Role cannot be changed
													</div>
												</div>
											)}
											<div className="mb-3">
												<div className="form-check">
													<input
														className="form-check-input"
														type="checkbox"
														name="is_active"
														id="is_active"
														checked={
															formData.is_active
														}
														onChange={handleChange}
													/>
													<label
														className="form-check-label"
														htmlFor="is_active"
													>
														Active User
													</label>
													<div className="form-text">
														Inactive users cannot
														log in to the system
													</div>
												</div>
											</div>

											{/* Read-only fields */}
											<div className="mb-3">
												<label className="form-label">
													Username
												</label>
												<input
													type="text"
													className="form-control"
													value={user.username}
													disabled
												/>
												<div className="form-text">
													Username cannot be changed
												</div>
											</div>
											<div className="mb-3">
												<label className="form-label">
													<CreditCard
														size={14}
														className="me-1"
													/>
													National ID
												</label>
												<input
													type="text"
													className="form-control"
													value={user.national_id}
													disabled
												/>
												<div className="form-text">
													National ID cannot be
													changed
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Address Information */}
							<div className="card">
								<div className="card-header">
									<h6 className="card-title mb-0">
										<MapPin size={16} className="me-2" />
										Address Information
									</h6>
								</div>
								<div className="card-body">
									<div className="mb-3">
										<label className="form-label">
											Address
										</label>
										<textarea
											className="form-control"
											name="address"
											rows="3"
											value={formData.address}
											onChange={handleChange}
											placeholder="Enter full address"
										></textarea>
									</div>
								</div>
							</div>

							{/* Read-only Information */}
							<div className="row mt-3">
								<div className="col-md-6">
									<div className="card bg-light">
										<div className="card-header">
											<h6 className="card-title mb-0">
												Account Information
											</h6>
										</div>
										<div className="card-body small">
											<div className="mb-2">
												<strong>
													Approval Status:
												</strong>
												<span
													className={`badge ms-2 ${
														user.approval_status ===
														"approved"
															? "bg-success"
															: user.approval_status ===
															  "pending"
															? "bg-warning text-dark"
															: "bg-danger"
													}`}
												>
													{user.approval_status}
												</span>
											</div>
											<div className="mb-2">
												<strong>Created:</strong>{" "}
												{new Date(
													user.created_at
												).toLocaleDateString()}
											</div>
											<div className="mb-2">
												<strong>Branch:</strong>{" "}
												{user.branchName ||
													"No Branch Assigned"}
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="card bg-light">
										<div className="card-header">
											<h6 className="card-title mb-0">
												Account Statistics
											</h6>
										</div>
										<div className="card-body small">
											<div className="mb-2">
												<strong>Total Accounts:</strong>{" "}
												{user.accountCount || 0}
											</div>
											<div className="mb-2">
												<strong>Total Balance:</strong>{" "}
												$
												{user.totalBalance
													? parseFloat(
															user.totalBalance
													  ).toLocaleString()
													: "0.00"}
											</div>
											<div className="mb-2">
												<strong>Last Login:</strong>{" "}
												{user.last_login
													? new Date(
															user.last_login
													  ).toLocaleDateString()
													: "Never"}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								onClick={onClose}
								disabled={loading}
							>
								<X size={16} className="me-1" />
								Cancel
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={loading}
							>
								<Save size={16} className="me-1" />
								{loading ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default EditUserModal;
