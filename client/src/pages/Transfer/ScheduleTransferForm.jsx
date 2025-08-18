import { useState, useEffect } from "react";
import {
	Calendar,
	Clock,
	Repeat,
	User,
	DollarSign,
	FileText,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
	transformServerAccountsForTransfer,
	validateAmount,
	formatAccountOption,
} from "./transferUtils";

const ScheduleTransferForm = ({
	accounts,
	onSubmit,
	onCancel,
	loading = false,
	error = null,
	initialData = null,
}) => {
	const [formData, setFormData] = useState({
		fromAccount: "",
		toAccount: "",
		beneficiaryName: "",
		amount: "",
		frequency: "monthly",
		startDate: "",
		endDate: "",
		maxExecutions: "",
		reference: "",
		description: "",
		transferType: "internal", // internal, external
	});

	const [formErrors, setFormErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize form with existing data for editing
	useEffect(() => {
		if (initialData) {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);

			setFormData({
				fromAccount: initialData.fromAccount?.toString() || "",
				toAccount:
					initialData.toAccount?.toString() ||
					initialData.external_account_number ||
					"",
				beneficiaryName: initialData.beneficiary_name || "",
				amount: initialData.amount?.toString() || "",
				frequency: initialData.frequency?.toLowerCase() || "monthly",
				startDate: initialData.start_date
					? new Date(initialData.start_date)
							.toISOString()
							.split("T")[0]
					: tomorrow.toISOString().split("T")[0],
				endDate: initialData.end_date
					? new Date(initialData.end_date).toISOString().split("T")[0]
					: "",
				maxExecutions: initialData.max_executions?.toString() || "",
				reference: initialData.reference || "",
				description: initialData.description || "",
				transferType: initialData.toAccount ? "internal" : "external",
			});
		} else {
			// Set default start date to tomorrow
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			setFormData((prev) => ({
				...prev,
				startDate: tomorrow.toISOString().split("T")[0],
			}));
		}
	}, [initialData]);

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear field-specific error when user starts typing
		if (formErrors[field]) {
			setFormErrors((prev) => ({
				...prev,
				[field]: undefined,
			}));
		}

		// Handle transfer type change
		if (field === "transferType") {
			setFormData((prev) => ({
				...prev,
				toAccount: "",
				beneficiaryName: "",
			}));
		}
	};

	const validateForm = () => {
		const errors = {};

		// From Account
		if (!formData.fromAccount) {
			errors.fromAccount = "Please select a source account";
		}

		// To Account / Beneficiary
		if (!formData.toAccount) {
			errors.toAccount =
				formData.transferType === "internal"
					? "Please select a destination account"
					: "Please enter account number or email";
		}

		// Beneficiary Name for external transfers
		if (
			formData.transferType === "external" &&
			!formData.beneficiaryName.trim()
		) {
			errors.beneficiaryName = "Please enter beneficiary name";
		}

		// Amount
		const amountValidation = validateAmount(formData.amount);
		if (!amountValidation.isValid) {
			errors.amount = amountValidation.error;
		}

		// Start Date
		if (!formData.startDate) {
			errors.startDate = "Please select a start date";
		} else {
			const startDate = new Date(formData.startDate);
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			if (startDate < today) {
				errors.startDate = "Start date cannot be in the past";
			}
		}

		// End Date (if provided)
		if (formData.endDate) {
			const startDate = new Date(formData.startDate);
			const endDate = new Date(formData.endDate);

			if (endDate <= startDate) {
				errors.endDate = "End date must be after start date";
			}
		}

		// Max Executions (if provided)
		if (formData.maxExecutions) {
			const maxExec = parseInt(formData.maxExecutions);
			if (isNaN(maxExec) || maxExec < 1 || maxExec > 9999) {
				errors.maxExecutions = "Must be a number between 1 and 9999";
			}
		}

		// Either end date or max executions should be provided
		if (!formData.endDate && !formData.maxExecutions) {
			errors.endCondition =
				"Please specify either an end date or maximum number of executions";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Find the from account
			const fromAccount = accounts.find(
				(acc) => acc.id.toString() === formData.fromAccount
			);

			if (!fromAccount) {
				throw new Error("Source account not found");
			}

			// Prepare the standing order data
			let standingOrderData = {
				from_account_id: parseInt(formData.fromAccount),
				amount: parseFloat(formData.amount),
				frequency: formData.frequency,
				start_date: formData.startDate,
				reference:
					formData.reference ||
					`Scheduled ${formData.frequency} transfer`,
				description: formData.description,
			};

			// Add end conditions
			if (formData.endDate) {
				standingOrderData.end_date = formData.endDate;
			}
			if (formData.maxExecutions) {
				standingOrderData.max_executions = parseInt(
					formData.maxExecutions
				);
			}

			// Handle internal vs external transfer
			if (formData.transferType === "internal") {
				const toAccount = accounts.find(
					(acc) => acc.id.toString() === formData.toAccount
				);
				if (!toAccount) {
					throw new Error("Destination account not found");
				}

				standingOrderData.to_account_number = toAccount.fullNumber;
				standingOrderData.beneficiary_name = toAccount.name;
			} else {
				standingOrderData.to_account_number = formData.toAccount;
				standingOrderData.beneficiary_name = formData.beneficiaryName;
			}

			await onSubmit(standingOrderData);
		} catch (error) {
			console.error("Schedule transfer error:", error);
			setFormErrors({
				submit: error.message || "Failed to schedule transfer",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const frequencyOptions = [
		{ value: "daily", label: "Daily" },
		{ value: "weekly", label: "Weekly" },
		{ value: "monthly", label: "Monthly" },
		{ value: "yearly", label: "Yearly" },
	];

	const getNextExecutionPreview = () => {
		if (!formData.startDate || !formData.frequency) return null;

		const startDate = new Date(formData.startDate);
		const nextDate = new Date(startDate);

		switch (formData.frequency) {
			case "daily":
				nextDate.setDate(nextDate.getDate() + 1);
				break;
			case "weekly":
				nextDate.setDate(nextDate.getDate() + 7);
				break;
			case "monthly":
				nextDate.setMonth(nextDate.getMonth() + 1);
				break;
			case "yearly":
				nextDate.setFullYear(nextDate.getFullYear() + 1);
				break;
		}

		return nextDate.toLocaleDateString();
	};

	return (
		<Card className="border-0 shadow-sm">
			<div className="card-header bg-transparent border-bottom-0 pb-0">
				<div className="d-flex align-items-center">
					<div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
						<Calendar size={20} className="text-primary" />
					</div>
					<div>
						<h5 className="fw-medium mb-1">
							{initialData
								? "Edit Scheduled Transfer"
								: "Schedule New Transfer"}
						</h5>
						<p className="text-muted small mb-0">
							Set up automatic recurring transfers
						</p>
					</div>
				</div>
			</div>

			<div className="card-body">
				<form onSubmit={handleSubmit}>
					{/* Transfer Type */}
					<div className="mb-4">
						<label className="form-label small fw-medium">
							Transfer Type
						</label>
						<div className="btn-group w-100" role="group">
							<input
								type="radio"
								className="btn-check"
								name="transferType"
								id="internal"
								value="internal"
								checked={formData.transferType === "internal"}
								onChange={(e) =>
									handleInputChange(
										"transferType",
										e.target.value
									)
								}
							/>
							<label
								className="btn btn-outline-primary"
								htmlFor="internal"
							>
								Between My Accounts
							</label>

							<input
								type="radio"
								className="btn-check"
								name="transferType"
								id="external"
								value="external"
								checked={formData.transferType === "external"}
								onChange={(e) =>
									handleInputChange(
										"transferType",
										e.target.value
									)
								}
							/>
							<label
								className="btn btn-outline-primary"
								htmlFor="external"
							>
								To External Account
							</label>
						</div>
					</div>

					<div className="row g-3">
						{/* From Account */}
						<div className="col-md-6">
							<label className="form-label small fw-medium">
								<User size={16} className="me-2" />
								From Account
							</label>
							<select
								className={`form-select ${
									formErrors.fromAccount ? "is-invalid" : ""
								}`}
								value={formData.fromAccount}
								onChange={(e) =>
									handleInputChange(
										"fromAccount",
										e.target.value
									)
								}
							>
								<option value="">Select source account</option>
								{accounts.map((account) => (
									<option key={account.id} value={account.id}>
										{formatAccountOption(account)}
									</option>
								))}
							</select>
							{formErrors.fromAccount && (
								<div className="invalid-feedback">
									{formErrors.fromAccount}
								</div>
							)}
						</div>

						{/* To Account */}
						<div className="col-md-6">
							<label className="form-label small fw-medium">
								<User size={16} className="me-2" />
								{formData.transferType === "internal"
									? "To Account"
									: "Account Number/Email"}
							</label>
							{formData.transferType === "internal" ? (
								<select
									className={`form-select ${
										formErrors.toAccount ? "is-invalid" : ""
									}`}
									value={formData.toAccount}
									onChange={(e) =>
										handleInputChange(
											"toAccount",
											e.target.value
										)
									}
								>
									<option value="">
										Select destination account
									</option>
									{accounts
										.filter(
											(account) =>
												account.id.toString() !==
												formData.fromAccount
										)
										.map((account) => (
											<option
												key={account.id}
												value={account.id}
											>
												{formatAccountOption(account)}
											</option>
										))}
								</select>
							) : (
								<Input
									type="text"
									placeholder="Enter account number or email"
									value={formData.toAccount}
									onChange={(e) =>
										handleInputChange(
											"toAccount",
											e.target.value
										)
									}
									error={formErrors.toAccount}
								/>
							)}
						</div>

						{/* Beneficiary Name (for external transfers) */}
						{formData.transferType === "external" && (
							<div className="col-md-6">
								<label className="form-label small fw-medium">
									<User size={16} className="me-2" />
									Beneficiary Name
								</label>
								<Input
									type="text"
									placeholder="Enter beneficiary name"
									value={formData.beneficiaryName}
									onChange={(e) =>
										handleInputChange(
											"beneficiaryName",
											e.target.value
										)
									}
									error={formErrors.beneficiaryName}
								/>
							</div>
						)}

						{/* Amount */}
						<div className="col-md-6">
							<label className="form-label small fw-medium">
								<DollarSign size={16} className="me-2" />
								Amount
							</label>
							<Input
								type="number"
								step="0.01"
								min="0.01"
								placeholder="0.00"
								value={formData.amount}
								onChange={(e) =>
									handleInputChange("amount", e.target.value)
								}
								error={formErrors.amount}
							/>
						</div>

						{/* Frequency */}
						<div className="col-md-6">
							<label className="form-label small fw-medium">
								<Repeat size={16} className="me-2" />
								Frequency
							</label>
							<select
								className="form-select"
								value={formData.frequency}
								onChange={(e) =>
									handleInputChange(
										"frequency",
										e.target.value
									)
								}
							>
								{frequencyOptions.map((option) => (
									<option
										key={option.value}
										value={option.value}
									>
										{option.label}
									</option>
								))}
							</select>
						</div>

						{/* Start Date */}
						<div className="col-md-6">
							<label className="form-label small fw-medium">
								<Calendar size={16} className="me-2" />
								Start Date
							</label>
							<Input
								type="date"
								value={formData.startDate}
								onChange={(e) =>
									handleInputChange(
										"startDate",
										e.target.value
									)
								}
								error={formErrors.startDate}
							/>
							{getNextExecutionPreview() && (
								<small className="text-muted">
									Next execution: {getNextExecutionPreview()}
								</small>
							)}
						</div>

						{/* End Date */}
						<div className="col-md-6">
							<label className="form-label small fw-medium">
								<Calendar size={16} className="me-2" />
								End Date (Optional)
							</label>
							<Input
								type="date"
								value={formData.endDate}
								onChange={(e) =>
									handleInputChange("endDate", e.target.value)
								}
								error={formErrors.endDate}
							/>
						</div>

						{/* Max Executions */}
						<div className="col-md-6">
							<label className="form-label small fw-medium">
								<Clock size={16} className="me-2" />
								Max Executions (Optional)
							</label>
							<Input
								type="number"
								min="1"
								max="9999"
								placeholder="Leave empty for unlimited"
								value={formData.maxExecutions}
								onChange={(e) =>
									handleInputChange(
										"maxExecutions",
										e.target.value
									)
								}
								error={formErrors.maxExecutions}
							/>
						</div>

						{/* Reference */}
						<div className="col-md-6">
							<label className="form-label small fw-medium">
								<FileText size={16} className="me-2" />
								Reference
							</label>
							<Input
								type="text"
								placeholder="Payment reference"
								value={formData.reference}
								onChange={(e) =>
									handleInputChange(
										"reference",
										e.target.value
									)
								}
							/>
						</div>

						{/* Description */}
						<div className="col-12">
							<label className="form-label small fw-medium">
								<FileText size={16} className="me-2" />
								Description (Optional)
							</label>
							<textarea
								className="form-control"
								rows="2"
								placeholder="Add notes about this scheduled transfer"
								value={formData.description}
								onChange={(e) =>
									handleInputChange(
										"description",
										e.target.value
									)
								}
							/>
						</div>
					</div>

					{/* End Condition Warning */}
					{formErrors.endCondition && (
						<div className="alert alert-warning mt-3" role="alert">
							<small>{formErrors.endCondition}</small>
						</div>
					)}

					{/* Submit Error */}
					{formErrors.submit && (
						<div className="alert alert-danger mt-3" role="alert">
							{formErrors.submit}
						</div>
					)}

					{/* General Error */}
					{error && (
						<div className="alert alert-danger mt-3" role="alert">
							{error.message ||
								"An error occurred. Please try again."}
						</div>
					)}

					{/* Form Actions */}
					<div className="d-flex gap-2 mt-4">
						<Button
							type="submit"
							variant="primary"
							loading={loading || isSubmitting}
							disabled={loading || isSubmitting}
						>
							{initialData
								? "Update Schedule"
								: "Create Schedule"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={loading || isSubmitting}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</Card>
	);
};

export default ScheduleTransferForm;
