import { useState, useEffect } from "react";
import { Settings, Shield, DollarSign } from "lucide-react";
import { useUpdateCard, useChangeCardPin } from "../../hooks/api/apiHooks";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const CardSettingsModal = ({ show, onHide, card, onCardUpdated }) => {
	const [activeTab, setActiveTab] = useState("settings");
	const [formData, setFormData] = useState({
		card_name: "",
		daily_limit: "",
		monthly_limit: "",
		contactless_enabled: true,
		online_transactions_enabled: true,
		international_transactions_enabled: false,
	});
	const [pinData, setPinData] = useState({
		current_pin: "",
		new_pin: "",
		confirm_pin: "",
	});
	const [errors, setErrors] = useState({});

	const {
		mutate: updateCard,
		loading: updatingCard,
		error: updateError,
		data: updateResult,
		reset: resetUpdate,
	} = useUpdateCard();

	const {
		mutate: changePin,
		loading: changingPin,
		error: pinError,
		data: pinResult,
		reset: resetPin,
	} = useChangeCardPin();

	useEffect(() => {
		if (card && show) {
			setFormData({
				card_name: card.card_name || "",
				daily_limit: card.daily_limit?.toString() || "",
				monthly_limit: card.monthly_limit?.toString() || "",
				contactless_enabled: card.contactless_enabled ?? true,
				online_transactions_enabled:
					card.online_transactions_enabled ?? true,
				international_transactions_enabled:
					card.international_transactions_enabled ?? false,
			});
		}
	}, [card, show]);

	useEffect(() => {
		if (updateResult?.success) {
			onCardUpdated?.(updateResult.data);
			resetUpdate();
			onHide();
		}
	}, [updateResult, onCardUpdated, resetUpdate, onHide]);

	useEffect(() => {
		if (pinResult?.success) {
			setPinData({ current_pin: "", new_pin: "", confirm_pin: "" });
			setErrors({});
			resetPin();
			alert("PIN changed successfully!");
		}
	}, [pinResult, resetPin]);

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));

		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handlePinChange = (e) => {
		const { name, value } = e.target;
		setPinData((prev) => ({ ...prev, [name]: value }));

		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateSettings = () => {
		const newErrors = {};

		if (!formData.card_name.trim()) {
			newErrors.card_name = "Card name is required";
		} else if (formData.card_name.length < 2) {
			newErrors.card_name = "Card name must be at least 2 characters";
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

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validatePin = () => {
		const newErrors = {};

		if (card?.pin_hash && !pinData.current_pin) {
			newErrors.current_pin = "Current PIN is required";
		}

		if (!pinData.new_pin) {
			newErrors.new_pin = "New PIN is required";
		} else if (!/^\d{4}$/.test(pinData.new_pin)) {
			newErrors.new_pin = "PIN must be exactly 4 digits";
		}

		if (pinData.new_pin !== pinData.confirm_pin) {
			newErrors.confirm_pin = "PINs do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSaveSettings = () => {
		if (!validateSettings()) return;

		const updateData = {
			cardId: card.id,
			card_name: formData.card_name.trim(),
			daily_limit: parseFloat(formData.daily_limit),
			monthly_limit: parseFloat(formData.monthly_limit),
			contactless_enabled: formData.contactless_enabled,
			online_transactions_enabled: formData.online_transactions_enabled,
			international_transactions_enabled:
				formData.international_transactions_enabled,
		};

		updateCard(updateData);
	};

	const handleChangePin = () => {
		if (!validatePin()) return;

		const pinChangeData = {
			cardId: card.id,
			current_pin: pinData.current_pin || undefined,
			new_pin: pinData.new_pin,
		};

		changePin(pinChangeData);
	};

	const handleClose = () => {
		setErrors({});
		resetUpdate();
		resetPin();
		onHide();
	};

	if (!show || !card) return null;

	return (
		<div
			className="modal fade show d-block"
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
		>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title d-flex align-items-center">
							<Settings size={20} className="me-2" />
							Card Settings - {card.card_name}
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={handleClose}
						></button>
					</div>

					<div className="modal-body">
						{/* Tabs */}
						<ul className="nav nav-tabs mb-4">
							<li className="nav-item">
								<button
									className={`nav-link ${
										activeTab === "settings" ? "active" : ""
									}`}
									onClick={() => setActiveTab("settings")}
								>
									<DollarSign size={16} className="me-1" />
									Card Settings
								</button>
							</li>
							<li className="nav-item">
								<button
									className={`nav-link ${
										activeTab === "security" ? "active" : ""
									}`}
									onClick={() => setActiveTab("security")}
								>
									<Shield size={16} className="me-1" />
									Security
								</button>
							</li>
						</ul>

						{/* Settings Tab */}
						{activeTab === "settings" && (
							<div>
								{/* Card Name */}
								<div className="mb-4">
									<label className="form-label">
										Card Name
									</label>
									<Input
										name="card_name"
										value={formData.card_name}
										onChange={handleInputChange}
										error={errors.card_name}
										placeholder="Enter card name"
									/>
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

								{/* Transaction Settings */}
								<div className="mb-4">
									<h6 className="mb-3">
										Transaction Settings
									</h6>
									<div className="form-check mb-3">
										<input
											className="form-check-input"
											type="checkbox"
											name="contactless_enabled"
											checked={
												formData.contactless_enabled
											}
											onChange={handleInputChange}
											id="contactless"
										/>
										<label
											className="form-check-label"
											htmlFor="contactless"
										>
											Enable Contactless Payments
											<small className="d-block text-muted">
												Allow tap-to-pay transactions
											</small>
										</label>
									</div>

									<div className="form-check mb-3">
										<input
											className="form-check-input"
											type="checkbox"
											name="online_transactions_enabled"
											checked={
												formData.online_transactions_enabled
											}
											onChange={handleInputChange}
											id="online"
										/>
										<label
											className="form-check-label"
											htmlFor="online"
										>
											Enable Online Transactions
											<small className="d-block text-muted">
												Allow online and e-commerce
												purchases
											</small>
										</label>
									</div>

									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											name="international_transactions_enabled"
											checked={
												formData.international_transactions_enabled
											}
											onChange={handleInputChange}
											id="international"
										/>
										<label
											className="form-check-label"
											htmlFor="international"
										>
											Enable International Transactions
											<small className="d-block text-muted">
												Allow transactions outside your
												home country
											</small>
										</label>
									</div>
								</div>

								{updateError && (
									<div className="alert alert-danger">
										<strong>Error:</strong>{" "}
										{updateError.message ||
											"Failed to update card settings"}
									</div>
								)}
							</div>
						)}

						{/* Security Tab */}
						{activeTab === "security" && (
							<div>
								<div className="mb-4">
									<h6 className="mb-3">Change PIN</h6>
									<p className="text-muted">
										{card.pin_hash
											? "Update your existing PIN with a new 4-digit PIN"
											: "Set up a new 4-digit PIN for your card"}
									</p>
								</div>

								{card.pin_hash && (
									<div className="mb-3">
										<label className="form-label">
											Current PIN
										</label>
										<Input
											name="current_pin"
											type="password"
											maxLength="4"
											value={pinData.current_pin}
											onChange={handlePinChange}
											error={errors.current_pin}
											placeholder="Enter current PIN"
										/>
									</div>
								)}

								<div className="row g-3 mb-4">
									<div className="col-md-6">
										<label className="form-label">
											New PIN
										</label>
										<Input
											name="new_pin"
											type="password"
											maxLength="4"
											value={pinData.new_pin}
											onChange={handlePinChange}
											error={errors.new_pin}
											placeholder="Enter new 4-digit PIN"
										/>
									</div>
									<div className="col-md-6">
										<label className="form-label">
											Confirm PIN
										</label>
										<Input
											name="confirm_pin"
											type="password"
											maxLength="4"
											value={pinData.confirm_pin}
											onChange={handlePinChange}
											error={errors.confirm_pin}
											placeholder="Confirm new PIN"
										/>
									</div>
								</div>

								{pinError && (
									<div className="alert alert-danger">
										<strong>Error:</strong>{" "}
										{pinError.message ||
											"Failed to change PIN"}
									</div>
								)}
							</div>
						)}
					</div>

					<div className="modal-footer">
						<Button
							type="button"
							variant="secondary"
							onClick={handleClose}
							disabled={updatingCard || changingPin}
						>
							Cancel
						</Button>
						{activeTab === "settings" ? (
							<Button
								type="button"
								variant="primary"
								onClick={handleSaveSettings}
								loading={updatingCard}
							>
								{updatingCard ? "Saving..." : "Save Settings"}
							</Button>
						) : (
							<Button
								type="button"
								variant="primary"
								onClick={handleChangePin}
								loading={changingPin}
							>
								{changingPin ? "Changing PIN..." : "Change PIN"}
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CardSettingsModal;
