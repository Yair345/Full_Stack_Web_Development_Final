import { useState, useEffect } from "react";
import { X, DollarSign, CreditCard, PiggyBank, Building, AlertCircle } from "lucide-react";
import { useCheckExistingAccounts } from "../../hooks/api/features/useAccountHooks";

const CreateAccountModal = ({ isOpen, onClose, onSubmit, accounts = [] }) => {
	const [formData, setFormData] = useState({
		account_type: "checking",
		currency: "USD",
		initial_deposit: "",
		account_name: "",
		overdraft_limit: ""
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Use the new hook to check for existing accounts
	const { hasCheckingAccount, loading: checkingLoading, checkExistingAccounts } = useCheckExistingAccounts();

	// Check for existing accounts when modal opens
	useEffect(() => {
		if (isOpen) {
			checkExistingAccounts();
		}
	}, [isOpen, checkExistingAccounts]);

	const accountTypes = [
		{
			value: "checking",
			label: "Checking Account",
			icon: CreditCard,
			description: "For daily transactions and bill payments",
			minDeposit: 100,
			features: ["No withdrawal limits", "Debit card included", "Online banking"]
		},
		{
			value: "savings",
			label: "Savings Account",
			icon: PiggyBank,
			description: "Earn interest on your savings",
			minDeposit: 500,
			features: ["Higher interest rate", "Limited withdrawals", "Compound interest"]
		},
		{
			value: "business",
			label: "Business Account",
			icon: Building,
			description: "For business and professional needs",
			minDeposit: 1000,
			features: ["Business features", "Higher limits", "Professional banking"]
		}
	];

	const currencies = [
		{ value: "USD", label: "US Dollar ($)", symbol: "$" },
		{ value: "EUR", label: "Euro (€)", symbol: "€" },
		{ value: "GBP", label: "British Pound (£)", symbol: "£" },
		{ value: "ILS", label: "Israeli Shekel (₪)", symbol: "₪" }
	];

	const selectedAccountType = accountTypes.find(type => type.value === formData.account_type);
	const selectedCurrency = currencies.find(currency => currency.value === formData.currency);

	// Find existing checking account using original database structure (for balance info when needed)
	const checkingAccount = accounts.find(account => 
		account.account_type === 'checking' && (account.is_active === 1 || account.is_active === true)
	);

	// Use the API check for existence validation, fallback to local check if API hasn't loaded yet
	const hasCheckingAccountFinal = hasCheckingAccount || !!checkingAccount;

	// Filter account types based on existing accounts (only checking is limited to one)
	const availableAccountTypes = accountTypes.filter(type => {
		if (type.value === 'checking' && hasCheckingAccountFinal) {
			return false;
		}
		return true; // Business and savings accounts can have multiple instances
	});

	// Update selected account type if current selection is no longer available
	useEffect(() => {
		const isCurrentTypeAvailable = availableAccountTypes.some(type => type.value === formData.account_type);
		if (!isCurrentTypeAvailable && availableAccountTypes.length > 0) {
			setFormData(prev => ({
				...prev,
				account_type: availableAccountTypes[0].value
			}));
		}
	}, [availableAccountTypes, formData.account_type]);

	const validateForm = () => {
		const newErrors = {};

		// Account type validation - check for duplicates (only checking accounts are limited)
		if (formData.account_type === 'checking' && hasCheckingAccountFinal) {
			newErrors.account_type = "You already have a checking account. Only one checking account is allowed per user.";
		}

		// Account name validation
		if (!formData.account_name || formData.account_name.trim().length < 2) {
			newErrors.account_name = "Account name must be at least 2 characters";
		}

		// Initial deposit validation
		const depositAmount = parseFloat(formData.initial_deposit);
		if (!formData.initial_deposit || isNaN(depositAmount) || depositAmount < 0) {
			newErrors.initial_deposit = "Please enter a valid deposit amount";
		} else {
			const minDeposit = selectedAccountType?.minDeposit || 0;
			if (depositAmount < minDeposit) {
				newErrors.initial_deposit = `Minimum deposit for ${selectedAccountType?.label} is ${selectedCurrency?.symbol}${minDeposit}`;
			}
			
			// For non-checking accounts, validate against checking account balance
			if (formData.account_type !== 'checking' && checkingAccount && depositAmount > 0) {
				const availableBalance = checkingAccount.balance + (checkingAccount.overdraft_limit || 0);
				if (depositAmount > availableBalance) {
					newErrors.initial_deposit = `Insufficient funds in checking account. Available: ${selectedCurrency?.symbol}${availableBalance.toFixed(2)}`;
				}
			}
			
			// For non-checking accounts, require checking account
			if (formData.account_type !== 'checking' && !checkingAccount && depositAmount > 0) {
				newErrors.initial_deposit = "You need a checking account to deposit funds into other account types";
			}
		}

		// Overdraft limit validation (for checking accounts)
		if (formData.account_type === "checking" && formData.overdraft_limit) {
			const overdraftAmount = parseFloat(formData.overdraft_limit);
			if (isNaN(overdraftAmount) || overdraftAmount < 0) {
				newErrors.overdraft_limit = "Overdraft limit must be a positive number";
			} else if (overdraftAmount > 5000) {
				newErrors.overdraft_limit = "Overdraft limit cannot exceed $5,000";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);
		try {
			const submitData = {
				account_type: formData.account_type,
				currency: formData.currency,
				account_name: formData.account_name.trim(),
				initial_deposit: parseFloat(formData.initial_deposit),
			};

			// Add overdraft limit for checking accounts
			if (formData.account_type === "checking" && formData.overdraft_limit) {
				submitData.overdraft_limit = parseFloat(formData.overdraft_limit);
			}

			await onSubmit(submitData);

			// Reset form
			setFormData({
				account_type: "checking",
				currency: "USD",
				initial_deposit: "",
				account_name: "",
				overdraft_limit: ""
			});
			setErrors({});
			onClose();
		} catch (error) {
			// Handle specific token expiry error
			if (error.message.includes('expired') || error.message.includes('unauthorized')) {
				setErrors({ 
					submit: "Your session has expired. Please refresh the page and try again." 
				});
				// Optionally redirect to login after a delay
				setTimeout(() => {
					window.location.href = '/login';
				}, 3000);
			} else {
				setErrors({ submit: error.message || "Failed to create account" });
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
		
		// Special validation for account type changes
		if (field === 'account_type') {
			if (value === 'checking' && hasCheckingAccountFinal) {
				setErrors(prev => ({ 
					...prev, 
					account_type: "You already have a checking account. Only one checking account is allowed per user." 
				}));
			}
		}
	};

	if (!isOpen) return null;

	return (
		<div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
			<div className="modal-dialog modal-lg modal-dialog-centered">
				<div className="modal-content">
					{/* Modal Header */}
					<div className="modal-header border-bottom">
						<h5 className="modal-title d-flex align-items-center">
							<CreditCard className="me-2 text-primary" size={24} />
							Open New Account
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							disabled={isSubmitting}
						></button>
					</div>

					{/* Modal Body */}
					<div className="modal-body">
						<form onSubmit={handleSubmit}>
							{/* Account Type Selection */}
							<div className="mb-4">
								<label className="form-label fw-semibold">Select Account Type</label>
								
								{/* Show restriction notice if checking account exists */}
								{checkingAccount && (
									<div className="alert alert-info d-flex align-items-center mb-3">
										<AlertCircle size={16} className="me-2" />
										<small>
											You already have a checking account. You can only have one checking account per user.
											{formData.account_type !== 'checking' && checkingAccount && (
												<span className="d-block mt-1">
													Initial deposits will be transferred from your checking account (Available: {selectedCurrency?.symbol}{(checkingAccount.balance + (checkingAccount.overdraft_limit || 0)).toFixed(2)}).
												</span>
											)}
										</small>
									</div>
								)}
								
								{/* Account Type Validation Error */}
								{errors.account_type && (
									<div className="alert alert-danger d-flex align-items-center mb-3">
										<AlertCircle size={16} className="me-2" />
										<small>{errors.account_type}</small>
									</div>
								)}
								
								<div className="row g-3">
									{availableAccountTypes.length === 0 ? (
										<div className="col-12">
											<div className="alert alert-warning">
												<AlertCircle size={16} className="me-2" />
												No account types are available for creation at this time.
											</div>
										</div>
									) : (
										availableAccountTypes.map((type) => {
										const IconComponent = type.icon;
										const isSelected = formData.account_type === type.value;
										
										return (
											<div key={type.value} className="col-12">
												<div
													className={`card h-100 cursor-pointer border-2 ${
														isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
													}`}
													onClick={() => handleInputChange("account_type", type.value)}
												>
													<div className="card-body p-3">
														<div className="d-flex align-items-start">
															<div className="me-3">
																<IconComponent 
																	size={32} 
																	className={isSelected ? 'text-primary' : 'text-muted'} 
																/>
															</div>
															<div className="flex-grow-1">
																<h6 className={`card-title mb-1 ${isSelected ? 'text-primary' : ''}`}>
																	{type.label}
																</h6>
																<p className="card-text text-muted small mb-2">
																	{type.description}
																</p>
																<div className="small text-muted">
																	<div className="mb-1">
																		<strong>Min. Deposit:</strong> {selectedCurrency?.symbol}{type.minDeposit}
																	</div>
																	<div>
																		<strong>Features:</strong> {type.features.join(", ")}
																	</div>
																</div>
															</div>
															<div className="ms-2">
																<input
																	type="radio"
																	name="account_type"
																	value={type.value}
																	checked={isSelected}
																	onChange={(e) => handleInputChange("account_type", e.target.value)}
																	className="form-check-input"
																/>
															</div>
														</div>
													</div>
												</div>
											</div>
										);
									}))}
								</div>
							</div>

							{/* Account Name */}
							<div className="mb-3">
								<label className="form-label">
									Account Name <span className="text-danger">*</span>
								</label>
								<input
									type="text"
									className={`form-control ${errors.account_name ? 'is-invalid' : ''}`}
									value={formData.account_name}
									onChange={(e) => handleInputChange("account_name", e.target.value)}
									placeholder="Enter a name for your account"
									disabled={isSubmitting}
								/>
								{errors.account_name && (
									<div className="invalid-feedback d-flex align-items-center">
										<AlertCircle size={16} className="me-1" />
										{errors.account_name}
									</div>
								)}
							</div>

							{/* Currency Selection */}
							<div className="mb-3">
								<label className="form-label">Currency</label>
								<select
									className="form-select"
									value={formData.currency}
									onChange={(e) => handleInputChange("currency", e.target.value)}
									disabled={isSubmitting}
								>
									{currencies.map((currency) => (
										<option key={currency.value} value={currency.value}>
											{currency.label}
										</option>
									))}
								</select>
							</div>

							{/* Initial Deposit */}
							<div className="mb-3">
								<label className="form-label">
									Initial Deposit <span className="text-danger">*</span>
								</label>
								<div className="input-group">
									<span className="input-group-text">
										{selectedCurrency?.symbol}
									</span>
									<input
										type="number"
										step="0.01"
										min="0"
										className={`form-control ${errors.initial_deposit ? 'is-invalid' : ''}`}
										value={formData.initial_deposit}
										onChange={(e) => handleInputChange("initial_deposit", e.target.value)}
										placeholder="0.00"
										disabled={isSubmitting}
									/>
									{errors.initial_deposit && (
										<div className="invalid-feedback d-flex align-items-center">
											<AlertCircle size={16} className="me-1" />
											{errors.initial_deposit}
										</div>
									)}
								</div>
								{formData.initial_deposit && selectedAccountType && (
									<div className="form-text">
										Minimum deposit: {selectedCurrency?.symbol}{selectedAccountType.minDeposit}
										{formData.account_type !== 'checking' && checkingAccount && parseFloat(formData.initial_deposit) > 0 && (
											<div className="text-warning mt-1">
												<AlertCircle size={14} className="me-1" />
												This amount will be transferred from your checking account
											</div>
										)}
									</div>
								)}
							</div>

							{/* Overdraft Limit (for checking accounts only) */}
							{formData.account_type === "checking" && (
								<div className="mb-3">
									<label className="form-label">
										Overdraft Limit <span className="text-muted">(Optional)</span>
									</label>
									<div className="input-group">
										<span className="input-group-text">
											{selectedCurrency?.symbol}
										</span>
										<input
											type="number"
											step="0.01"
											min="0"
											max="5000"
											className={`form-control ${errors.overdraft_limit ? 'is-invalid' : ''}`}
											value={formData.overdraft_limit}
											onChange={(e) => handleInputChange("overdraft_limit", e.target.value)}
											placeholder="0.00"
											disabled={isSubmitting}
										/>
										{errors.overdraft_limit && (
											<div className="invalid-feedback d-flex align-items-center">
												<AlertCircle size={16} className="me-1" />
												{errors.overdraft_limit}
											</div>
										)}
									</div>
									<div className="form-text">
										Maximum overdraft limit: $5,000
									</div>
								</div>
							)}

							{/* Submit Error */}
							{errors.submit && (
								<div className="alert alert-danger d-flex align-items-center">
									<AlertCircle size={20} className="me-2" />
									<div>{errors.submit}</div>
								</div>
							)}

							{/* Account Summary */}
							<div className="card bg-light">
								<div className="card-body">
									<h6 className="card-title mb-3">Account Summary</h6>
									<div className="row g-2 small">
										<div className="col-6">
											<strong>Account Type:</strong>
										</div>
										<div className="col-6">
											{selectedAccountType?.label}
										</div>
										<div className="col-6">
											<strong>Account Name:</strong>
										</div>
										<div className="col-6">
											{formData.account_name || "Not specified"}
										</div>
										<div className="col-6">
											<strong>Currency:</strong>
										</div>
										<div className="col-6">
											{selectedCurrency?.label}
										</div>
										<div className="col-6">
											<strong>Initial Deposit:</strong>
										</div>
										<div className="col-6">
											{formData.initial_deposit ? 
												`${selectedCurrency?.symbol}${parseFloat(formData.initial_deposit).toLocaleString()}` : 
												`${selectedCurrency?.symbol}0.00`
											}
										</div>
										{formData.account_type === "checking" && formData.overdraft_limit && (
											<>
												<div className="col-6">
													<strong>Overdraft Limit:</strong>
												</div>
												<div className="col-6">
													{selectedCurrency?.symbol}{parseFloat(formData.overdraft_limit).toLocaleString()}
												</div>
											</>
										)}
										{formData.account_type !== "checking" && parseFloat(formData.initial_deposit) > 0 && checkingAccount && (
											<>
												<div className="col-6">
													<strong>Transfer Source:</strong>
												</div>
												<div className="col-6">
													Checking Account
												</div>
												<div className="col-6">
													<strong>Available Balance:</strong>
												</div>
												<div className="col-6">
													{selectedCurrency?.symbol}{(checkingAccount.balance + (checkingAccount.overdraft_limit || 0)).toFixed(2)}
												</div>
											</>
										)}
									</div>
								</div>
							</div>
						</form>
					</div>

					{/* Modal Footer */}
					<div className="modal-footer">
						<button
							type="button"
							className="btn btn-secondary"
							onClick={onClose}
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn-primary"
							onClick={handleSubmit}
							disabled={
								isSubmitting || 
								!formData.account_name || 
								!formData.initial_deposit ||
								(formData.account_type === 'checking' && hasCheckingAccount)
							}
						>
							{isSubmitting ? (
								<>
									<span className="spinner-border spinner-border-sm me-2" />
									Creating Account...
								</>
							) : (
								<>
									<CreditCard size={16} className="me-2" />
									Create Account
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateAccountModal;
