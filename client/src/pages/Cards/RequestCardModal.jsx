import { useState, useEffect } from "react";
import { X, CreditCard, ShieldCheck } from "lucide-react";
import { useAccounts, useCreateCard } from "../../hooks/api/apiHooks";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const RequestCardModal = ({ show, onHide, onCardCreated }) => {
	const [formData, setFormData] = useState({
		account_id: "",
		card_type: "debit",
		card_name: "",
		daily_limit: "1000",
		monthly_limit: "30000",
		pin: "",
		confirmPin: "",
	});

	const [errors, setErrors] = useState({});

	const { accounts, loading: accountsLoading } = useAccounts();
	const {
		mutate: createCard,
		loading: creatingCard,
		error: cardError,
		data: createdCard,
		reset: resetMutation,
	} = useCreateCard();

	// Filter out savings accounts
	const eligibleAccounts =
		accounts?.filter(
			(account) =>
				account.type !== "savings" && account.status === "active"
		) || [];

	useEffect(() => {
		if (createdCard?.success) {
			onCardCreated?.(createdCard.data);
			onHide();
			resetForm();
			resetMutation();
		}
	}, [createdCard, onCardCreated, onHide, resetMutation]);

	const resetForm = () => {
		setFormData({
			account_id: "",
			card_type: "debit",
			card_name: "",
			daily_limit: "1000",
			monthly_limit: "30000",
			pin: "",
			confirmPin: "",
		});
		setErrors({});
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear specific field error
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.account_id) {
			newErrors.account_id = "Please select an account";
		}

		if (!formData.card_name.trim()) {
			newErrors.card_name = "Card name is required";
		} else if (formData.card_name.length < 2) {
			newErrors.card_name = "Card name must be at least 2 characters";
		} else if (!/^[a-zA-Z\s.'-]+$/.test(formData.card_name)) {
			newErrors.card_name =
				"Card name can only contain letters, spaces, periods, apostrophes, and hyphens";
		}

		const dailyLimit = parseFloat(formData.daily_limit);
		if (isNaN(dailyLimit) || dailyLimit < 0 || dailyLimit > 50000) {
			newErrors.daily_limit =
				"Daily limit must be between $0 and $50,000";
		}

		const monthlyLimit = parseFloat(formData.monthly_limit);
		if (isNaN(monthlyLimit) || monthlyLimit < 0 || monthlyLimit > 1000000) {
			newErrors.monthly_limit =
				"Monthly limit must be between $0 and $1,000,000";
		}

		if (monthlyLimit < dailyLimit) {
			newErrors.monthly_limit =
				"Monthly limit cannot be less than daily limit";
		}

		if (formData.pin && !/^\d{4}$/.test(formData.pin)) {
			newErrors.pin = "PIN must be exactly 4 digits";
		}

		if (formData.pin && formData.pin !== formData.confirmPin) {
			newErrors.confirmPin = "PINs do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const cardData = {
			account_id: parseInt(formData.account_id),
			card_type: formData.card_type,
			card_name: formData.card_name.trim(),
			daily_limit: parseFloat(formData.daily_limit),
			monthly_limit: parseFloat(formData.monthly_limit),
		};

		// Only include PIN if provided
		if (formData.pin) {
			cardData.pin = formData.pin;
		}

		createCard(cardData);
	};

	const handleClose = () => {
		resetForm();
		resetMutation();
		onHide();
	};

	if (!show) return null;

	return (
		<div
			className="modal fade show d-block"
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
		>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title d-flex align-items-center">
							<CreditCard size={20} className="me-2" />
							Request New Card
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={handleClose}
						></button>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="modal-body">
							{/* Account Selection */}
							<div className="mb-4">
								<label className="form-label">
									Select Account *
								</label>
								<select
									name="account_id"
									className={`form-select ${
										errors.account_id ? "is-invalid" : ""
									}`}
									value={formData.account_id}
									onChange={handleInputChange}
									disabled={accountsLoading}
								>
									<option value="">
										Choose an account...
									</option>
									{eligibleAccounts.map((account) => (
										<option
											key={account.id}
											value={account.id}
										>
											{account.name} -{" "}
											{account.type
												.charAt(0)
												.toUpperCase() +
												account.type.slice(1)}
											({account.number}) - $
											{account.balance?.toFixed(2)}
										</option>
									))}
								</select>
								{errors.account_id && (
									<div className="invalid-feedback">
										{errors.account_id}
									</div>
								)}
								{eligibleAccounts.length === 0 &&
									!accountsLoading && (
										<div className="form-text text-warning">
											No eligible accounts found. Cards
											can only be issued for checking and
											business accounts.
										</div>
									)}
							</div>

							{/* Card Type */}
							<div className="mb-4">
								<label className="form-label">
									Card Type *
								</label>
								<div className="row g-3">
									<div className="col-6">
										<div
											className={`card h-100 ${
												formData.card_type === "debit"
													? "border-primary"
													: ""
											}`}
											style={{ cursor: "pointer" }}
											onClick={() =>
												handleInputChange({
													target: {
														name: "card_type",
														value: "debit",
													},
												})
											}
										>
											<div className="card-body text-center">
												<input
													type="radio"
													name="card_type"
													value="debit"
													checked={
														formData.card_type ===
														"debit"
													}
													onChange={handleInputChange}
													className="form-check-input mb-2"
												/>
												<h6>Debit Card</h6>
												<small className="text-muted">
													Use your account balance
													directly
												</small>
											</div>
										</div>
									</div>
									<div className="col-6">
										<div
											className={`card h-100 ${
												formData.card_type === "credit"
													? "border-primary"
													: ""
											}`}
											style={{ cursor: "pointer" }}
											onClick={() =>
												handleInputChange({
													target: {
														name: "card_type",
														value: "credit",
													},
												})
											}
										>
											<div className="card-body text-center">
												<input
													type="radio"
													name="card_type"
													value="credit"
													checked={
														formData.card_type ===
														"credit"
													}
													onChange={handleInputChange}
													className="form-check-input mb-2"
												/>
												<h6>Credit Card</h6>
												<small className="text-muted">
													Credit line with monthly
													statements
												</small>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Card Name */}
							<div className="mb-4">
								<label className="form-label">
									Card Name *
								</label>
								<Input
									name="card_name"
									placeholder="e.g., My Primary Card"
									value={formData.card_name}
									onChange={handleInputChange}
									error={errors.card_name}
								/>
								<div className="form-text">
									This name will appear on your card
									statements
								</div>
							</div>

							{/* Spending Limits */}
							<div className="row g-3 mb-4">
								<div className="col-md-6">
									<label className="form-label">
										Daily Spending Limit ($)
									</label>
									<Input
										name="daily_limit"
										type="number"
										min="0"
										max="50000"
										step="0.01"
										value={formData.daily_limit}
										onChange={handleInputChange}
										error={errors.daily_limit}
									/>
								</div>
								<div className="col-md-6">
									<label className="form-label">
										Monthly Spending Limit ($)
									</label>
									<Input
										name="monthly_limit"
										type="number"
										min="0"
										max="1000000"
										step="0.01"
										value={formData.monthly_limit}
										onChange={handleInputChange}
										error={errors.monthly_limit}
									/>
								</div>
							</div>

							{/* PIN Setup */}
							<div className="mb-4">
								<h6 className="d-flex align-items-center mb-3">
									<ShieldCheck size={18} className="me-2" />
									PIN Setup (Optional)
								</h6>
								<div className="row g-3">
									<div className="col-md-6">
										<label className="form-label">
											4-Digit PIN
										</label>
										<Input
											name="pin"
											type="password"
											maxLength="4"
											placeholder="****"
											value={formData.pin}
											onChange={handleInputChange}
											error={errors.pin}
										/>
									</div>
									<div className="col-md-6">
										<label className="form-label">
											Confirm PIN
										</label>
										<Input
											name="confirmPin"
											type="password"
											maxLength="4"
											placeholder="****"
											value={formData.confirmPin}
											onChange={handleInputChange}
											error={errors.confirmPin}
											disabled={!formData.pin}
										/>
									</div>
								</div>
								<div className="form-text">
									You can set up a PIN later if you prefer to
									leave this blank
								</div>
							</div>

							{cardError && (
								<div className="alert alert-danger">
									<strong>Error:</strong>{" "}
									{cardError.message ||
										"Failed to create card. Please try again."}
								</div>
							)}
						</div>

						<div className="modal-footer">
							<Button
								type="button"
								variant="secondary"
								onClick={handleClose}
								disabled={creatingCard}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="primary"
								loading={creatingCard}
								disabled={eligibleAccounts.length === 0}
							>
								{creatingCard
									? "Creating Card..."
									: "Request Card"}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default RequestCardModal;
