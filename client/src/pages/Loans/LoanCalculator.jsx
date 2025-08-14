import { useState } from "react";
import { Calculator, DollarSign } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { calculateLoanPayment, formatCurrency } from "./loanUtils";

const LoanCalculator = () => {
	const [calculatorValues, setCalculatorValues] = useState({
		amount: "",
		term: "",
		rate: 5.5,
		type: "personal",
	});
	const [result, setResult] = useState(null);

	const handleCalculate = () => {
		const payment = calculateLoanPayment(
			calculatorValues.amount,
			calculatorValues.term,
			calculatorValues.rate
		);

		if (payment > 0) {
			const totalPaid = payment * parseInt(calculatorValues.term);
			const totalInterest =
				totalPaid - parseFloat(calculatorValues.amount);

			setResult({
				monthlyPayment: payment,
				totalPaid,
				totalInterest,
			});
		}
	};

	const handleInputChange = (field, value) => {
		setCalculatorValues((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<div className="col-12">
			<div className="row g-4">
				<div className="col-lg-6">
					<Card>
						<div className="d-flex align-items-center mb-4">
							<Calculator
								size={20}
								className="text-primary me-2"
							/>
							<h5 className="fw-medium mb-0">Loan Calculator</h5>
						</div>

						<div className="row g-3">
							<div className="col-12">
								<label className="form-label">Loan Type</label>
								<select
									className="form-select"
									value={calculatorValues.type}
									onChange={(e) =>
										handleInputChange(
											"type",
											e.target.value
										)
									}
								>
									<option value="personal">
										Personal Loan
									</option>
									<option value="auto">Auto Loan</option>
									<option value="mortgage">Mortgage</option>
									<option value="student">
										Student Loan
									</option>
								</select>
							</div>

							<div className="col-md-6">
								<label className="form-label">
									Loan Amount
								</label>
								<div className="input-group">
									<span className="input-group-text">$</span>
									<Input
										type="number"
										placeholder="25000"
										value={calculatorValues.amount}
										onChange={(e) =>
											handleInputChange(
												"amount",
												e.target.value
											)
										}
									/>
								</div>
							</div>

							<div className="col-md-6">
								<label className="form-label">
									Interest Rate (%)
								</label>
								<Input
									type="number"
									step="0.01"
									placeholder="5.5"
									value={calculatorValues.rate}
									onChange={(e) =>
										handleInputChange(
											"rate",
											e.target.value
										)
									}
								/>
							</div>

							<div className="col-12">
								<label className="form-label">
									Loan Term (months)
								</label>
								<Input
									type="number"
									placeholder="60"
									value={calculatorValues.term}
									onChange={(e) =>
										handleInputChange(
											"term",
											e.target.value
										)
									}
								/>
							</div>

							<div className="col-12">
								<Button
									variant="primary"
									className="w-100"
									onClick={handleCalculate}
								>
									<DollarSign size={16} className="me-2" />
									Calculate Payment
								</Button>
							</div>
						</div>
					</Card>
				</div>

				<div className="col-lg-6">
					<Card>
						<h6 className="fw-medium mb-3">Calculation Results</h6>

						{result ? (
							<div className="row g-3">
								<div className="col-12">
									<div className="text-center p-4 bg-light rounded">
										<div className="h3 fw-bold text-primary mb-1">
											{formatCurrency(
												result.monthlyPayment
											)}
										</div>
										<small className="text-muted">
											Monthly Payment
										</small>
									</div>
								</div>

								<div className="col-6">
									<div className="text-center">
										<div className="fw-bold">
											{formatCurrency(result.totalPaid)}
										</div>
										<small className="text-muted">
											Total Paid
										</small>
									</div>
								</div>

								<div className="col-6">
									<div className="text-center">
										<div className="fw-bold text-warning">
											{formatCurrency(
												result.totalInterest
											)}
										</div>
										<small className="text-muted">
											Total Interest
										</small>
									</div>
								</div>

								<div className="col-12">
									<div className="alert alert-info">
										<small>
											<strong>Note:</strong> This is an
											estimate. Actual loan terms and
											rates may vary based on your credit
											score and other factors.
										</small>
									</div>
								</div>
							</div>
						) : (
							<div className="text-center py-4 text-muted">
								<Calculator
									size={48}
									className="mb-3 opacity-50"
								/>
								<p>
									Enter loan details to calculate your monthly
									payment
								</p>
							</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
};

export default LoanCalculator;
