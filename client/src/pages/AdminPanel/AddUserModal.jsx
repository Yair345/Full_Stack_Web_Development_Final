import { useState } from "react";
import { X, User, Save, Eye, EyeOff } from "lucide-react";

const AddUserModal = ({ branches = [], onAdd, onClose, onSuccess }) => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		first_name: "",
		last_name: "",
		phone: "",
		address: "",
		date_of_birth: "",
		national_id: "",
		role: "customer",
		branch_id: "",
		is_active: true,
		approval_status: "approved",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			// Basic validation
			if (!formData.username || !formData.email || !formData.password) {
				throw new Error("Username, email, and password are required");
			}

			if (!formData.first_name || !formData.last_name) {
				throw new Error("First name and last name are required");
			}

			if (!formData.date_of_birth || !formData.national_id) {
				throw new Error("Date of birth and national ID are required");
			}

			// Email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				throw new Error("Please enter a valid email address");
			}

			// Password validation
			if (formData.password.length < 6) {
				throw new Error("Password must be at least 6 characters long");
			}

			await onAdd(formData);
			onSuccess();
		} catch (error) {
			setError(error.message || "Failed to create user");
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	return (
		<div
			className="modal show d-block"
			tabIndex="-1"
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
		>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">
							<User size={20} className="me-2" />
							Add New User
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							disabled={isLoading}
						></button>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="modal-body">
							{error && (
								<div className="alert alert-danger">
									{error}
								</div>
							)}

							<div className="row g-3">
								{/* Basic Information */}
								<div className="col-12">
									<h6 className="text-primary mb-3">
										Basic Information
									</h6>
								</div>

								<div className="col-md-6">
									<label className="form-label">
										Username *
									</label>
									<input
										type="text"
										className="form-control"
										name="username"
										value={formData.username}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="col-md-6">
									<label className="form-label">
										Email *
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

								<div className="col-md-6">
									<label className="form-label">
										Password *
									</label>
									<div className="input-group">
										<input
											type={
												showPassword
													? "text"
													: "password"
											}
											className="form-control"
											name="password"
											value={formData.password}
											onChange={handleChange}
											required
											minLength="6"
										/>
										<button
											type="button"
											className="btn btn-outline-secondary"
											onClick={() =>
												setShowPassword(!showPassword)
											}
										>
											{showPassword ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</button>
									</div>
								</div>

								<div className="col-md-6">
									<label className="form-label">Role</label>
									<select
										className="form-select"
										name="role"
										value={formData.role}
										onChange={handleChange}
									>
										<option value="customer">
											Customer
										</option>
										<option value="manager">Manager</option>
										<option value="admin">Admin</option>
									</select>
								</div>

								{/* Personal Information */}
								<div className="col-12">
									<h6 className="text-primary mb-3">
										Personal Information
									</h6>
								</div>

								<div className="col-md-6">
									<label className="form-label">
										First Name *
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

								<div className="col-md-6">
									<label className="form-label">
										Last Name *
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

								<div className="col-md-6">
									<label className="form-label">Phone</label>
									<input
										type="tel"
										className="form-control"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
									/>
								</div>

								<div className="col-md-6">
									<label className="form-label">
										Date of Birth *
									</label>
									<input
										type="date"
										className="form-control"
										name="date_of_birth"
										value={formData.date_of_birth}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="col-md-6">
									<label className="form-label">
										National ID *
									</label>
									<input
										type="text"
										className="form-control"
										name="national_id"
										value={formData.national_id}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="col-md-6">
									<label className="form-label">Branch</label>
									<select
										className="form-select"
										name="branch_id"
										value={formData.branch_id}
										onChange={handleChange}
									>
										<option value="">
											No Branch Assigned
										</option>
										{branches.map((branch) => (
											<option
												key={branch.id}
												value={branch.id}
											>
												{branch.branch_name} -{" "}
												{branch.city}
											</option>
										))}
									</select>
								</div>

								<div className="col-12">
									<label className="form-label">
										Address
									</label>
									<textarea
										className="form-control"
										name="address"
										value={formData.address}
										onChange={handleChange}
										rows="2"
									/>
								</div>

								{/* Status Settings */}
								<div className="col-12">
									<h6 className="text-primary mb-3">
										Status Settings
									</h6>
								</div>

								<div className="col-md-6">
									<label className="form-label">
										Approval Status
									</label>
									<select
										className="form-select"
										name="approval_status"
										value={formData.approval_status}
										onChange={handleChange}
									>
										<option value="pending">Pending</option>
										<option value="approved">
											Approved
										</option>
										<option value="rejected">
											Rejected
										</option>
									</select>
								</div>

								<div className="col-md-6 d-flex align-items-end">
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											name="is_active"
											checked={formData.is_active}
											onChange={handleChange}
										/>
										<label className="form-check-label">
											Active User
										</label>
									</div>
								</div>
							</div>
						</div>

						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								onClick={onClose}
								disabled={isLoading}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<span className="spinner-border spinner-border-sm me-2"></span>
										Creating...
									</>
								) : (
									<>
										<Save size={16} className="me-2" />
										Create User
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AddUserModal;
