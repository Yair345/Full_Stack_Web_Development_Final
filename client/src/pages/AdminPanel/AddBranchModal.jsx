import { useState } from "react";
import { X, Building2 } from "lucide-react";

const AddBranchModal = ({
	availableManagers = [],
	onAdd,
	onClose,
	onSuccess,
}) => {
	const [formData, setFormData] = useState({
		branch_name: "",
		branch_code: "",
		address: "",
		city: "",
		state: "",
		postal_code: "",
		country: "Israel",
		phone: "",
		email: "",
		manager_id: "",
		opening_hours: {
			monday: "08:30-17:00",
			tuesday: "08:30-17:00",
			wednesday: "08:30-17:00",
			thursday: "08:30-17:00",
			friday: "08:30-13:00",
			saturday: "closed",
			sunday: "09:00-15:00",
		},
		services_offered: [
			"personal_banking",
			"business_banking",
			"loans",
			"mortgages",
			"investments",
		],
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleOpeningHoursChange = (day, value) => {
		setFormData((prev) => ({
			...prev,
			opening_hours: {
				...prev.opening_hours,
				[day]: value,
			},
		}));
	};

	const handleServiceChange = (service, checked) => {
		setFormData((prev) => ({
			...prev,
			services_offered: checked
				? [...prev.services_offered, service]
				: prev.services_offered.filter((s) => s !== service),
		}));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.branch_name.trim()) {
			newErrors.branch_name = "Branch name is required";
		}

		if (!formData.address.trim()) {
			newErrors.address = "Address is required";
		}

		if (!formData.city.trim()) {
			newErrors.city = "City is required";
		}

		if (!formData.state.trim()) {
			newErrors.state = "State is required";
		}

		if (!formData.postal_code.trim()) {
			newErrors.postal_code = "Postal code is required";
		} else if (!/^[0-9]{5,7}$/.test(formData.postal_code)) {
			newErrors.postal_code = "Postal code must be 5-7 digits";
		}

		if (!formData.phone.trim()) {
			newErrors.phone = "Phone is required";
		} else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phone)) {
			newErrors.phone = "Invalid phone number format";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Invalid email format";
		}

		if (
			formData.branch_code.trim() &&
			!/^[A-Z0-9_-]+$/.test(formData.branch_code)
		) {
			newErrors.branch_code =
				"Branch code must contain only uppercase letters, numbers, hyphens, and underscores";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		try {
			const submitData = {
				...formData,
				manager_id: formData.manager_id
					? parseInt(formData.manager_id)
					: null,
			};

			await onAdd(submitData);
			onSuccess();
		} catch (error) {
			console.error("Error adding branch:", error);
			setErrors({
				submit:
					error.message || "Failed to add branch. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const serviceOptions = [
		{ value: "personal_banking", label: "Personal Banking" },
		{ value: "business_banking", label: "Business Banking" },
		{ value: "loans", label: "Loans" },
		{ value: "mortgages", label: "Mortgages" },
		{ value: "investments", label: "Investments" },
		{ value: "currency_exchange", label: "Currency Exchange" },
		{ value: "safety_deposit", label: "Safety Deposit Boxes" },
	];

	return (
		<div
			className="modal fade show d-block"
			tabIndex="-1"
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
		>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<div className="d-flex align-items-center">
							<Building2
								size={24}
								className="text-primary me-2"
							/>
							<h5 className="modal-title mb-0">Add New Branch</h5>
						</div>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							disabled={loading}
						></button>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="modal-body">
							{errors.submit && (
								<div className="alert alert-danger">
									{errors.submit}
								</div>
							)}

							<div className="row">
								{/* Branch Information */}
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">
											Branch Name *
										</label>
										<input
											type="text"
											name="branch_name"
											className={`form-control ${
												errors.branch_name
													? "is-invalid"
													: ""
											}`}
											value={formData.branch_name}
											onChange={handleInputChange}
											placeholder="e.g., Downtown Branch"
										/>
										{errors.branch_name && (
											<div className="invalid-feedback">
												{errors.branch_name}
											</div>
										)}
									</div>

									<div className="mb-3">
										<label className="form-label">
											Branch Code
										</label>
										<input
											type="text"
											name="branch_code"
											className={`form-control ${
												errors.branch_code
													? "is-invalid"
													: ""
											}`}
											value={formData.branch_code}
											onChange={handleInputChange}
											placeholder="e.g., DT-001"
										/>
										{errors.branch_code && (
											<div className="invalid-feedback">
												{errors.branch_code}
											</div>
										)}
										<small className="form-text text-muted">
											Optional. Use uppercase letters,
											numbers, hyphens, and underscores
											only.
										</small>
									</div>

									<div className="mb-3">
										<label className="form-label">
											Manager
										</label>
										<select
											name="manager_id"
											className="form-select"
											value={formData.manager_id}
											onChange={handleInputChange}
										>
											<option value="">
												No manager assigned
											</option>
											{availableManagers.map(
												(manager) => (
													<option
														key={manager.id}
														value={manager.id}
													>
														{manager.first_name}{" "}
														{manager.last_name} (
														{manager.email})
													</option>
												)
											)}
										</select>
									</div>
								</div>

								{/* Location Information */}
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">
											Address *
										</label>
										<input
											type="text"
											name="address"
											className={`form-control ${
												errors.address
													? "is-invalid"
													: ""
											}`}
											value={formData.address}
											onChange={handleInputChange}
											placeholder="Full street address"
										/>
										{errors.address && (
											<div className="invalid-feedback">
												{errors.address}
											</div>
										)}
									</div>

									<div className="row">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">
													City *
												</label>
												<input
													type="text"
													name="city"
													className={`form-control ${
														errors.city
															? "is-invalid"
															: ""
													}`}
													value={formData.city}
													onChange={handleInputChange}
												/>
												{errors.city && (
													<div className="invalid-feedback">
														{errors.city}
													</div>
												)}
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">
													State *
												</label>
												<input
													type="text"
													name="state"
													className={`form-control ${
														errors.state
															? "is-invalid"
															: ""
													}`}
													value={formData.state}
													onChange={handleInputChange}
												/>
												{errors.state && (
													<div className="invalid-feedback">
														{errors.state}
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="row">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">
													Postal Code *
												</label>
												<input
													type="text"
													name="postal_code"
													className={`form-control ${
														errors.postal_code
															? "is-invalid"
															: ""
													}`}
													value={formData.postal_code}
													onChange={handleInputChange}
												/>
												{errors.postal_code && (
													<div className="invalid-feedback">
														{errors.postal_code}
													</div>
												)}
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">
													Country
												</label>
												<input
													type="text"
													name="country"
													className="form-control"
													value={formData.country}
													onChange={handleInputChange}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Contact Information */}
							<div className="row">
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">
											Phone *
										</label>
										<input
											type="tel"
											name="phone"
											className={`form-control ${
												errors.phone ? "is-invalid" : ""
											}`}
											value={formData.phone}
											onChange={handleInputChange}
											placeholder="+972-XX-XXXXXXX"
										/>
										{errors.phone && (
											<div className="invalid-feedback">
												{errors.phone}
											</div>
										)}
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">
											Email *
										</label>
										<input
											type="email"
											name="email"
											className={`form-control ${
												errors.email ? "is-invalid" : ""
											}`}
											value={formData.email}
											onChange={handleInputChange}
											placeholder="branch@bank.com"
										/>
										{errors.email && (
											<div className="invalid-feedback">
												{errors.email}
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Services Offered */}
							<div className="mb-3">
								<label className="form-label">
									Services Offered
								</label>
								<div className="row">
									{serviceOptions.map((service) => (
										<div
											key={service.value}
											className="col-md-4"
										>
											<div className="form-check">
												<input
													type="checkbox"
													className="form-check-input"
													id={`service-${service.value}`}
													checked={formData.services_offered.includes(
														service.value
													)}
													onChange={(e) =>
														handleServiceChange(
															service.value,
															e.target.checked
														)
													}
												/>
												<label
													className="form-check-label"
													htmlFor={`service-${service.value}`}
												>
													{service.label}
												</label>
											</div>
										</div>
									))}
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
								Cancel
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={loading}
							>
								{loading ? (
									<>
										<span
											className="spinner-border spinner-border-sm me-2"
											role="status"
											aria-hidden="true"
										></span>
										Creating...
									</>
								) : (
									<>
										<Building2 size={16} className="me-1" />
										Add Branch
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

export default AddBranchModal;
