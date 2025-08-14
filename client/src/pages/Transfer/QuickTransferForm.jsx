import { ArrowRightLeft } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { formatCurrency } from "./transferUtils";

const QuickTransferForm = ({
	accounts,
	transferForm,
	onInputChange,
	onSubmit,
}) => {
	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(transferForm);
	};

	return (
		<div className="col-lg-8">
			<Card>
				<h5 className="fw-medium mb-4">Send Money</h5>
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
							>
								<option value="">Select account</option>
								{accounts.map((account) => (
									<option key={account.id} value={account.id}>
										{account.name} ({account.number}) -{" "}
										{formatCurrency(account.balance)}
									</option>
								))}
							</select>
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
								>
									<option value="">Select account</option>
									{accounts
										.filter(
											(acc) =>
												acc.id.toString() !==
												transferForm.fromAccount
										)
										.map((account) => (
											<option
												key={account.id}
												value={account.id}
											>
												{account.name} ({account.number}
												)
											</option>
										))}
								</select>
							) : (
								<Input
									type="text"
									placeholder="Enter account number or email"
									value={transferForm.toAccount}
									onChange={(e) =>
										onInputChange(
											"toAccount",
											e.target.value
										)
									}
									required
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
								/>
							</div>
						</div>

						<div className="col-md-6">
							<label className="form-label">When</label>
							<select className="form-select">
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
							/>
						</div>

						<div className="col-12">
							<div className="d-flex gap-3">
								<Button
									type="submit"
									variant="primary"
									className="flex-grow-1"
								>
									<ArrowRightLeft
										size={16}
										className="me-2"
									/>
									Send Transfer
								</Button>
								<Button type="button" variant="outline">
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
