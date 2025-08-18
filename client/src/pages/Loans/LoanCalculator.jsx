import { useState } from "react";
import { Calculator, DollarSign } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { formatCurrency } from "./loanUtils";
import { useLoanCalculator } from "../../hooks/useLoans";

const LoanCalculator = () => {
	const [calculatorValues, setCalculatorValues] = useState({
		amount: "",
		term_months: "",
		interest_rate: 0.055, // 5.5% as decimal
		type: "personal",
	});

	const { calculation, loading, error, calculate, clearError } = useLoanCalculator();

	const handleCalculate = async () => {
		try {
			clearError();
			
			// Validation
			if (!calculatorValues.amount || !calculatorValues.term_months || !calculatorValues.interest_rate) {
				alert("Please fill in all fields");
				return;
			}

			const calculationData = {
				amount: parseFloat(calculatorValues.amount),
				term_months: parseInt(calculatorValues.term_months),
				interest_rate: parseFloat(calculatorValues.interest_rate)
			};

			await calculate(calculationData);
		} catch (err) {
			console.error("Calculation error:", err);
		}
	};

	const handleInputChange = (field, value) => {
		setCalculatorValues((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Convert percentage to decimal for API
	const handleRateChange = (value) => {
		const percentage = parseFloat(value) || 0;
		setCalculatorValues(prev => ({
			...prev,
			interest_rate: percentage / 100 // Convert to decimal
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
									value={(calculatorValues.interest_rate * 100).toFixed(2)}
									onChange={(e) =>
										handleRateChange(e.target.value)
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
									value={calculatorValues.term_months}
									onChange={(e) =>
										handleInputChange(
											"term_months",
											e.target.value
										)
									}
								/>
							</div>

							{error && (
								<div className="col-12">
									<div className="alert alert-danger">
										{error}
									</div>
								</div>
							)}

							<div className="col-12">
								<Button
									variant="primary"
									className="w-100"
									onClick={handleCalculate}
									disabled={loading}
								>
									{loading ? (
										<>
											<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
											Calculating...
										</>
									) : (
										<>
											<DollarSign size={16} className="me-2" />
											Calculate Payment
										</>
									)}
								</Button>
							</div>
						</div>
					</Card>
				</div>

				<div className="col-lg-6">
					<Card>
						<h6 className="fw-medium mb-3">Calculation Results</h6>

						{calculation ? (
							<div className="row g-3">
								<div className="col-12">
									<div className="text-center p-4 bg-light rounded">
										<div className="h3 fw-bold text-primary mb-1">
											{formatCurrency(calculation.monthlyPayment)}
										</div>
										<small className="text-muted">
											Monthly Payment
										</small>
									</div>
								</div>

								<div className="col-6">
									<div className="text-center">
										<div className="fw-bold">
											{formatCurrency(calculation.totalAmount)}
										</div>
										<small className="text-muted">
											Total Paid
										</small>
									</div>
								</div>

								<div className="col-6">
									<div className="text-center">
										<div className="fw-bold text-warning">
											{formatCurrency(calculation.totalInterest)}
										</div>
										<small className="text-muted">
											Total Interest
										</small>
									</div>
								</div>

								<div className="col-12">
									<div className="row g-2 small">
										<div className="col-6">
											<span className="text-muted">Principal:</span>
										</div>
										<div className="col-6 text-end">
											<span className="fw-medium">
												{formatCurrency(calculation.principal)}
											</span>
										</div>
										<div className="col-6">
											<span className="text-muted">Interest Rate:</span>
										</div>
										<div className="col-6 text-end">
											<span className="fw-medium">
												{(calculation.interestRate * 100).toFixed(2)}%
											</span>
										</div>
										<div className="col-6">
											<span className="text-muted">Term:</span>
										</div>
										<div className="col-6 text-end">
											<span className="fw-medium">
												{calculation.termMonths} months
											</span>
										</div>
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
