import { Eye, EyeOff } from "lucide-react";
import Input from "../../components/ui/Input";

const RegisterForm = ({
	formData,
	showPassword,
	showConfirmPassword,
	loading,
	errors,
	branches,
	loadingBranches,
	onFormChange,
	onPasswordToggle,
	onConfirmPasswordToggle,
	onSubmit,
}) => {
	return (
		<form onSubmit={onSubmit}>
			<div className="mb-3">
				<small className="text-muted">
					<span className="text-danger">*</span> Required fields
				</small>
			</div>
			<div className="row g-2 g-sm-3 mb-3">
				<div className="col-12 col-sm-6">
					<div className="mb-3 mb-sm-0">
						<label htmlFor="firstName" className="form-label">
							First Name <span className="text-danger">*</span>
						</label>
						<input
							id="firstName"
							name="firstName"
							type="text"
							autoComplete="given-name"
							required
							className={`form-control ${
								errors.firstName ? "is-invalid" : ""
							}`}
							placeholder="First Name"
							value={formData.firstName}
							onChange={onFormChange}
						/>
						{errors.firstName && (
							<div className="invalid-feedback">
								{errors.firstName}
							</div>
						)}
					</div>
				</div>
				<div className="col-12 col-sm-6">
					<div className="mb-3 mb-sm-0">
						<label htmlFor="lastName" className="form-label">
							Last Name <span className="text-danger">*</span>
						</label>
						<input
							id="lastName"
							name="lastName"
							type="text"
							autoComplete="family-name"
							required
							className={`form-control ${
								errors.lastName ? "is-invalid" : ""
							}`}
							placeholder="Last Name"
							value={formData.lastName}
							onChange={onFormChange}
						/>
						{errors.lastName && (
							<div className="invalid-feedback">
								{errors.lastName}
							</div>
						)}
					</div>
				</div>
			</div>

			<Input
				id="email"
				name="email"
				type="email"
				label="Email address"
				autoComplete="email"
				required
				placeholder="Email address"
				value={formData.email}
				onChange={onFormChange}
				error={errors.email}
			/>

			<Input
				id="phone"
				name="phone"
				type="tel"
				label="Phone Number"
				autoComplete="tel"
				required
				placeholder="Phone Number"
				value={formData.phone}
				onChange={onFormChange}
				error={errors.phone}
			/>

			<div className="row g-2 g-sm-3 mb-3">
				<div className="col-12 col-sm-6">
					<div className="mb-3 mb-sm-0">
						<label htmlFor="dateOfBirth" className="form-label">
							Date of Birth <span className="text-danger">*</span>
						</label>
						<input
							id="dateOfBirth"
							name="dateOfBirth"
							type="date"
							autoComplete="bday"
							required
							className={`form-control ${
								errors.dateOfBirth ? "is-invalid" : ""
							}`}
							value={formData.dateOfBirth}
							onChange={onFormChange}
						/>
						{errors.dateOfBirth && (
							<div className="invalid-feedback">
								{errors.dateOfBirth}
							</div>
						)}
					</div>
				</div>
				<div className="col-12 col-sm-6">
					<div className="mb-3 mb-sm-0">
						<label htmlFor="nationalId" className="form-label">
							National ID <span className="text-danger">*</span>
						</label>
						<input
							id="nationalId"
							name="nationalId"
							type="text"
							required
							className={`form-control ${
								errors.nationalId ? "is-invalid" : ""
							}`}
							placeholder="National ID"
							value={formData.nationalId}
							onChange={onFormChange}
						/>
						{errors.nationalId && (
							<div className="invalid-feedback">
								{errors.nationalId}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="mb-3">
				<label htmlFor="address" className="form-label">
					Address <span className="text-danger">*</span>
				</label>
				<textarea
					id="address"
					name="address"
					className={`form-control ${
						errors.address ? "is-invalid" : ""
					}`}
					placeholder="Full Address"
					rows="2"
					style={{ minHeight: "60px" }}
					required
					value={formData.address}
					onChange={onFormChange}
				/>
				{errors.address && (
					<div className="invalid-feedback">{errors.address}</div>
				)}
			</div>

			<div className="mb-3">
				<label htmlFor="branchId" className="form-label">
					Preferred Branch <span className="text-danger">*</span>
				</label>
				{loadingBranches ? (
					<div className="form-control d-flex align-items-center">
						<span
							className="spinner-border spinner-border-sm me-2"
							role="status"
						></span>
						Loading branches...
					</div>
				) : (
					<select
						id="branchId"
						name="branchId"
						className={`form-select ${
							errors.branchId ? "is-invalid" : ""
						}`}
						required
						value={formData.branchId || ""}
						onChange={onFormChange}
					>
						<option value="">Select a branch</option>
						{branches.map((branch) => (
							<option key={branch.id} value={branch.id}>
								{branch.branch_name} - {branch.city},{" "}
								{branch.state}
							</option>
						))}
					</select>
				)}
				{errors.branchId && (
					<div className="invalid-feedback">{errors.branchId}</div>
				)}
				<small className="form-text text-muted">
					Your account will require approval from the selected branch
					manager.
				</small>
			</div>

			<div className="mb-3">
				<label htmlFor="password" className="form-label">
					Password <span className="text-danger">*</span>
				</label>
				<div className="input-group">
					<input
						id="password"
						name="password"
						type={showPassword ? "text" : "password"}
						autoComplete="new-password"
						required
						className={`form-control ${
							errors.password ? "is-invalid" : ""
						}`}
						placeholder="Password"
						value={formData.password}
						onChange={onFormChange}
					/>
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={onPasswordToggle}
					>
						{showPassword ? (
							<EyeOff size={16} />
						) : (
							<Eye size={16} />
						)}
					</button>
				</div>
				{errors.password && (
					<div className="invalid-feedback d-block">
						{errors.password}
					</div>
				)}
			</div>

			<div className="mb-3">
				<label htmlFor="confirmPassword" className="form-label">
					Confirm Password <span className="text-danger">*</span>
				</label>
				<div className="input-group">
					<input
						id="confirmPassword"
						name="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						autoComplete="new-password"
						required
						className={`form-control ${
							errors.confirmPassword ? "is-invalid" : ""
						}`}
						placeholder="Confirm Password"
						value={formData.confirmPassword}
						onChange={onFormChange}
					/>
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={onConfirmPasswordToggle}
					>
						{showConfirmPassword ? (
							<EyeOff size={16} />
						) : (
							<Eye size={16} />
						)}
					</button>
				</div>
				{errors.confirmPassword && (
					<div className="invalid-feedback d-block">
						{errors.confirmPassword}
					</div>
				)}
			</div>

			<div className="mb-3">
				<div className="form-check">
					<input
						className="form-check-input"
						type="checkbox"
						id="acceptTerms"
						name="acceptTerms"
						checked={formData.acceptTerms}
						onChange={onFormChange}
						required
					/>
					<label
						className="form-check-label small"
						htmlFor="acceptTerms"
					>
						<span className="text-danger me-1">*</span>I agree to
						the{" "}
						<a href="#" className="text-decoration-none">
							Terms of Service
						</a>{" "}
						and{" "}
						<a href="#" className="text-decoration-none">
							Privacy Policy
						</a>
					</label>
				</div>
				{errors.acceptTerms && (
					<div className="text-danger small">
						{errors.acceptTerms}
					</div>
				)}
			</div>

			<div className="d-grid mb-3">
				<button
					type="submit"
					disabled={loading}
					className="btn btn-bank-primary"
				>
					{loading ? (
						<>
							<span
								className="spinner-border spinner-border-sm me-2"
								role="status"
								aria-hidden="true"
							></span>
							Creating Account...
						</>
					) : (
						"Create Account"
					)}
				</button>
			</div>
		</form>
	);
};

export default RegisterForm;
