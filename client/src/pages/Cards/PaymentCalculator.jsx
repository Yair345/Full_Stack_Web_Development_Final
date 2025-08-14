import { useState } from "react";
import { Calculator, DollarSign } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { calculateMonthlyPayment } from "./cardUtils";

const PaymentCalculator = () => {
	const [calculatorData, setCalculatorData] = useState({
		balance: "",
		interestRate: "",
		monthsToPayOff: "",
	});
	const [result, setResult] = useState(null);

	const handleCalculate = () => {
		const { balance, interestRate, monthsToPayOff } = calculatorData;

		if (!balance || !interestRate || !monthsToPayOff) {
			alert("Please fill in all fields");
			return;
		}

		const monthlyPayment = calculateMonthlyPayment(
			parseFloat(balance),
			parseFloat(interestRate),
			parseInt(monthsToPayOff)
		);

		const totalPaid = monthlyPayment * parseInt(monthsToPayOff);
		const totalInterest = totalPaid - parseFloat(balance);

		setResult({
			monthlyPayment,
			totalPaid,
			totalInterest,
		});
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	return (
		<div className="col-lg-6">
			<Card>
				<div className="d-flex align-items-center mb-4">
					<Calculator size={20} className="text-primary me-2" />
					<h5 className="fw-medium mb-0">Payment Calculator</h5>
				</div>

				<div className="row g-3 mb-4">
					<div className="col-12">
						<label className="form-label">Current Balance</label>
						<Input
							type="number"
							placeholder="Enter balance amount"
							value={calculatorData.balance}
							onChange={(e) =>
								setCalculatorData({
									...calculatorData,
									balance: e.target.value,
								})
							}
						/>
					</div>
					<div className="col-12">
						<label className="form-label">
							Annual Interest Rate (%)
						</label>
						<Input
							type="number"
							step="0.01"
							placeholder="Enter interest rate"
							value={calculatorData.interestRate}
							onChange={(e) =>
								setCalculatorData({
									...calculatorData,
									interestRate: e.target.value,
								})
							}
						/>
					</div>
					<div className="col-12">
						<label className="form-label">Months to Pay Off</label>
						<Input
							type="number"
							placeholder="Enter number of months"
							value={calculatorData.monthsToPayOff}
							onChange={(e) =>
								setCalculatorData({
									...calculatorData,
									monthsToPayOff: e.target.value,
								})
							}
						/>
					</div>
				</div>

				<Button
					variant="primary"
					className="w-100 mb-4"
					onClick={handleCalculate}
				>
					<DollarSign size={16} className="me-2" />
					Calculate Payment
				</Button>

				{result && (
					<div className="border rounded p-3 bg-light">
						<h6 className="fw-medium mb-3">Payment Breakdown</h6>
						<div className="row g-2 small">
							<div className="col-6">
								<span className="text-muted">
									Monthly Payment:
								</span>
							</div>
							<div className="col-6 text-end">
								<span className="fw-bold">
									{formatCurrency(result.monthlyPayment)}
								</span>
							</div>
							<div className="col-6">
								<span className="text-muted">
									Total Amount Paid:
								</span>
							</div>
							<div className="col-6 text-end">
								<span className="fw-medium">
									{formatCurrency(result.totalPaid)}
								</span>
							</div>
							<div className="col-6">
								<span className="text-muted">
									Total Interest:
								</span>
							</div>
							<div className="col-6 text-end">
								<span className="text-danger">
									{formatCurrency(result.totalInterest)}
								</span>
							</div>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
};

export default PaymentCalculator;
