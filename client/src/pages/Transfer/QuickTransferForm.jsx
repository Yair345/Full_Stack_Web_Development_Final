import { ArrowRightLeft, AlertCircle } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
	formatCurrency,
	validateTransferAmount,
	getMaxTransferAmount,
} from "./transferUtils";
import { useState } from "react";

const QuickTransferForm = ({
	accounts,
	transferForm,
	onInputChange,
	onSubmit,
	loading = false,
	error = null,
}) => {
	const [validationError, setValidationError] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		setValidationError("");

		// Find the selected from account
		const fromAccount = accounts.find(
			(acc) => acc.id.toString() === transferForm.fromAccount
		);

		// Validate the transfer
		if (fromAccount && transferForm.amount) {
			const validation = validateTransferAmount(
				transferForm.amount,
				fromAccount.balance,
				2500, // dailyLimit
				25000, // monthlyLimit
				750, // dailyUsed
				5200 // monthlyUsed
			);
			if (!validation.isValid) {
				setValidationError(validation.error);
				return;
			}
		}

		onSubmit(transferForm);
	};

	const getAvailableToAccounts = () => {
		return accounts.filter(
			(acc) => acc.id.toString() !== transferForm.fromAccount
		);
	};

	const selectedFromAccount = accounts.find(
		(acc) => acc.id.toString() === transferForm.fromAccount
	);

	return (
		<div className="col-lg-8">
			<Card>
				<h5 className="fw-medium mb-4">Send Money</h5>

				{/* Error Display */}
				{(error || validationError) && (
					<div
						className="alert alert-danger d-flex align-items-center mb-4"
						role="alert"
					>
						<AlertCircle size={16} className="me-2" />
						<div>{error?.message || validationError}</div>
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="row g-3">
						<div className="col-12">
							<label className="form-label">From Account</label>
							<select
								className="form-select"
								value={transferForm.fromAccount}
								onChange={(e) =>
									onInputChange("fromAccount", e.target.value)
								}
								required
								disabled={loading}
							>
								<option value="">Select account</option>
								{accounts.map((account) => (
									<option key={account.id} value={account.id}>
										{account.name} ({account.number}) -{" "}
										{formatCurrency(account.balance)}
									</option>
								))}
							</select>
							{selectedFromAccount && (
								<small className="form-text text-muted">
									Available:{" "}
									{formatCurrency(
										selectedFromAccount.balance
									)}
								</small>
							)}
						</div>

						<div className="col-12">
							<label className="form-label">Transfer Type</label>
							<div className="btn-group w-100" role="group">
								<input
									type="radio"
									className="btn-check"
									name="transferType"
									id="internal"
									checked={transferForm.type === "internal"}
									onChange={() =>
										onInputChange("type", "internal")
									}
									disabled={loading}
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
									checked={transferForm.type === "external"}
									onChange={() =>
										onInputChange("type", "external")
									}
									disabled={loading}
								/>
								<label
									className="btn btn-outline-primary"
									htmlFor="external"
								>
									To Another Person
								</label>

								<input
									type="radio"
									className="btn-check"
									name="transferType"
									id="wire"
									checked={transferForm.type === "wire"}
									onChange={() =>
										onInputChange("type", "wire")
									}
									disabled={loading}
								/>
								<label
									className="btn btn-outline-primary"
									htmlFor="wire"
								>
									Wire Transfer
								</label>
							</div>
						</div>

						<div className="col-12">
							<label className="form-label">
								{transferForm.type === "internal"
									? "To Account"
									: "Recipient Account"}
							</label>
							{transferForm.type === "internal" ? (
								<select
									className="form-select"
									value={transferForm.toAccount}
									onChange={(e) =>
										onInputChange(
											"toAccount",
											e.target.value
										)
									}
									required
									disabled={loading}
								>
									<option value="">Select account</option>
									{getAvailableToAccounts().map((account) => (
										<option
											key={account.id}
											value={account.id}
										>
											{account.name} ({account.number})
										</option>
									))}
								</select>
							) : (
								<Input
									type="text"
									placeholder={
										transferForm.type === "wire"
											? "Enter recipient account number"
											: "Enter account number or email"
									}
									value={transferForm.toAccount}
									onChange={(e) =>
										onInputChange(
											"toAccount",
											e.target.value
										)
									}
									required
									disabled={loading}
								/>
							)}
						</div>

						<div className="col-md-6">
							<label className="form-label">Amount</label>
							<div className="input-group">
								<span className="input-group-text">$</span>
								<Input
									type="number"
									step="0.01"
									min="0.01"
									placeholder="0.00"
									value={transferForm.amount}
									onChange={(e) =>
										onInputChange("amount", e.target.value)
									}
									required
									disabled={loading}
								/>
								{selectedFromAccount && (
									<div className="dropdown">
										<button
											className="btn btn-outline-secondary dropdown-toggle"
											type="button"
											data-bs-toggle="dropdown"
											aria-expanded="false"
											disabled={loading}
											style={{
												border: "none",
												borderLeft: "1px solid #dee2e6",
											}}
										>
											Max
										</button>
										<ul className="dropdown-menu">
											<li>
												<button
													className="dropdown-item"
													type="button"
													onClick={() => {
														const maxAmount =
															getMaxTransferAmount(
																selectedFromAccount.balance,
																2500, // dailyLimit
																25000, // monthlyLimit
																750, // dailyUsed
																5200 // monthlyUsed
															);
														onInputChange(
															"amount",
															maxAmount.toFixed(2)
														);
													}}
												>
													<div>
														<strong>
															Max Possible:{" "}
															{formatCurrency(
																getMaxTransferAmount(
																	selectedFromAccount.balance,
																	2500, // dailyLimit
																	25000, // monthlyLimit
																	750, // dailyUsed
																	5200 // monthlyUsed
																)
															)}
														</strong>
													</div>
												</button>
											</li>
											<li>
												<hr className="dropdown-divider" />
											</li>
											<li>
												<button
													className="dropdown-item"
													type="button"
													onClick={() =>
														onInputChange(
															"amount",
															selectedFromAccount.balance.toString()
														)
													}
												>
													Account Balance:{" "}
													{formatCurrency(
														selectedFromAccount.balance
													)}
												</button>
											</li>
											<li>
												<button
													className="dropdown-item"
													type="button"
													onClick={() =>
														onInputChange(
															"amount",
															"1750"
														)
													} // 2500 - 750 used
												>
													Daily Remaining:{" "}
													{formatCurrency(1750)}
												</button>
											</li>
											<li>
												<button
													className="dropdown-item"
													type="button"
													onClick={() =>
														onInputChange(
															"amount",
															"19800"
														)
													} // 25000 - 5200 used
												>
													Monthly Remaining:{" "}
													{formatCurrency(19800)}
												</button>
											</li>
										</ul>
									</div>
								)}
							</div>
							{selectedFromAccount && (
								<div className="mt-2">
									<div className="d-flex justify-content-between align-items-center mb-1">
										<small className="text-muted">
											Available Balance:
										</small>
										<small className="fw-medium">
											{formatCurrency(
												selectedFromAccount.balance
											)}
										</small>
									</div>
									<div className="d-flex justify-content-between align-items-center mb-1">
										<small className="text-muted">
											Daily Limit:
										</small>
										<small className="fw-medium">
											{formatCurrency(2500)}
										</small>
									</div>
									{transferForm.amount && (
										<div className="d-flex justify-content-between align-items-center">
											<small className="text-muted">
												Remaining Balance:
											</small>
											<small
												className={`fw-medium ${
													selectedFromAccount.balance -
														parseFloat(
															transferForm.amount ||
																0
														) <
													0
														? "text-danger"
														: "text-success"
												}`}
											>
												{formatCurrency(
													selectedFromAccount.balance -
														parseFloat(
															transferForm.amount ||
																0
														)
												)}
											</small>
										</div>
									)}
								</div>
							)}
						</div>

						<div className="col-md-6">
							<label className="form-label">When</label>
							<select className="form-select" disabled={loading}>
								<option value="now">Send Now</option>
								<option value="scheduled">
									Schedule for Later
								</option>
							</select>
						</div>

						<div className="col-12">
							<label className="form-label">
								Description (Optional)
							</label>
							<Input
								type="text"
								placeholder="What's this for?"
								value={transferForm.description}
								onChange={(e) =>
									onInputChange("description", e.target.value)
								}
								disabled={loading}
							/>
						</div>

						<div className="col-12">
							<div className="d-flex gap-3">
								<Button
									type="submit"
									variant="primary"
									className="flex-grow-1"
									disabled={
										loading ||
										!transferForm.fromAccount ||
										!transferForm.toAccount ||
										!transferForm.amount
									}
								>
									{loading ? (
										<>
											<span
												className="spinner-border spinner-border-sm me-2"
												role="status"
												aria-hidden="true"
											></span>
											Processing...
										</>
									) : (
										<>
											<ArrowRightLeft
												size={16}
												className="me-2"
											/>
											Send Transfer
										</>
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									disabled={loading}
								>
									Save as Template
								</Button>
							</div>
						</div>
					</div>
				</form>
			</Card>
		</div>
	);
};

export default QuickTransferForm;
