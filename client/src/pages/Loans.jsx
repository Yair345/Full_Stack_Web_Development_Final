import { useState, useEffect } from "react";
import {
	DollarSign,
	Home,
	Car,
	GraduationCap,
	CreditCard,
	Calculator,
	FileText,
	TrendingUp,
	Calendar,
	CheckCircle,
	Clock,
	AlertCircle,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Loans = () => {
	const [loans, setLoans] = useState([]);
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [calculatorValues, setCalculatorValues] = useState({
		amount: "",
		term: "",
		rate: 5.5,
		type: "personal",
	});

	// Mock data for existing loans
	const mockLoans = [
		{
			id: 1,
			type: "mortgage",
			name: "Home Mortgage",
			originalAmount: 350000,
			currentBalance: 298750.5,
			monthlyPayment: 1680.45,
			interestRate: 3.25,
			termMonths: 360,
			remainingMonths: 312,
			nextPaymentDate: "2025-09-01",
			status: "current",
		},
		{
			id: 2,
			type: "auto",
			name: "Auto Loan",
			originalAmount: 35000,
			currentBalance: 18250.75,
			monthlyPayment: 485.2,
			interestRate: 4.5,
			termMonths: 72,
			remainingMonths: 38,
			nextPaymentDate: "2025-08-25",
			status: "current",
		},
		{
			id: 3,
			type: "personal",
			name: "Personal Loan",
			originalAmount: 15000,
			currentBalance: 8750.0,
			monthlyPayment: 425.3,
			interestRate: 8.75,
			termMonths: 48,
			remainingMonths: 22,
			nextPaymentDate: "2025-08-20",
			status: "current",
		},
	];

	// Mock data for loan applications
	const mockApplications = [
		{
			id: 1,
			type: "personal",
			amount: 25000,
			purpose: "Home Improvement",
			status: "under_review",
			submittedDate: "2025-08-10",
			expectedDecision: "2025-08-17",
		},
		{
			id: 2,
			type: "auto",
			amount: 45000,
			purpose: "Vehicle Purchase",
			status: "approved",
			submittedDate: "2025-08-05",
			approvedDate: "2025-08-12",
			rate: 4.25,
		},
	];

	const loanTypes = [
		{
			type: "personal",
			name: "Personal Loan",
			icon: DollarSign,
			description:
				"For personal expenses, debt consolidation, or major purchases",
			rates: "5.99% - 24.99% APR",
			terms: "12 - 84 months",
			maxAmount: "$50,000",
		},
		{
			type: "mortgage",
			name: "Home Mortgage",
			icon: Home,
			description:
				"Purchase or refinance your home with competitive rates",
			rates: "3.25% - 7.50% APR",
			terms: "15 - 30 years",
			maxAmount: "$2,000,000",
		},
		{
			type: "auto",
			name: "Auto Loan",
			icon: Car,
			description: "Finance your new or used vehicle purchase",
			rates: "3.99% - 18.99% APR",
			terms: "12 - 84 months",
			maxAmount: "$150,000",
		},
		{
			type: "student",
			name: "Student Loan",
			icon: GraduationCap,
			description: "Fund your education with flexible repayment options",
			rates: "4.50% - 12.00% APR",
			terms: "5 - 20 years",
			maxAmount: "$100,000",
		},
	];

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setLoans(mockLoans);
				setApplications(mockApplications);
			} catch (err) {
				console.error("Error loading loan data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const getLoanIcon = (type) => {
		const iconMap = {
			mortgage: Home,
			auto: Car,
			personal: DollarSign,
			student: GraduationCap,
		};
		const IconComponent = iconMap[type] || DollarSign;
		return <IconComponent size={20} />;
	};

	const getStatusBadge = (status) => {
		const statusMap = {
			current: { class: "bg-success", text: "Current" },
			late: { class: "bg-warning", text: "Late" },
			overdue: { class: "bg-danger", text: "Overdue" },
			approved: { class: "bg-success", text: "Approved" },
			under_review: { class: "bg-warning", text: "Under Review" },
			denied: { class: "bg-danger", text: "Denied" },
		};
		const statusInfo = statusMap[status] || {
			class: "bg-secondary",
			text: "Unknown",
		};
		return (
			<span className={`badge ${statusInfo.class}`}>
				{statusInfo.text}
			</span>
		);
	};

	const calculatePayment = () => {
		const { amount, term, rate } = calculatorValues;
		if (!amount || !term || !rate) return 0;

		const principal = parseFloat(amount);
		const monthlyRate = parseFloat(rate) / 100 / 12;
		const numPayments = parseInt(term);

		if (monthlyRate === 0) return principal / numPayments;

		const payment =
			(principal *
				(monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
			(Math.pow(1 + monthlyRate, numPayments) - 1);

		return payment;
	};

	const handleApplyLoan = (loanType) => {
		console.log("Apply for loan:", loanType);
		alert(`Loan application for ${loanType} will be available soon!`);
	};

	if (loading) {
		return (
			<div className="row g-4">
				<div className="col-12">
					<div className="d-flex justify-content-center py-5">
						<div
							className="spinner-border text-primary"
							role="status"
						>
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="row g-4">
			{/* Header */}
			<div className="col-12">
				<div>
					<h1 className="h2 fw-bold text-dark mb-1">Loans</h1>
					<p className="text-muted">
						Manage your loans and apply for new ones
					</p>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="col-12">
				<ul className="nav nav-pills mb-4">
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "overview" ? "active" : ""
							}`}
							onClick={() => setActiveTab("overview")}
						>
							<TrendingUp size={16} className="me-2" />
							Overview
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "apply" ? "active" : ""
							}`}
							onClick={() => setActiveTab("apply")}
						>
							<FileText size={16} className="me-2" />
							Apply for Loan
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "calculator" ? "active" : ""
							}`}
							onClick={() => setActiveTab("calculator")}
						>
							<Calculator size={16} className="me-2" />
							Calculator
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "applications" ? "active" : ""
							}`}
							onClick={() => setActiveTab("applications")}
						>
							<Clock size={16} className="me-2" />
							Applications
						</button>
					</li>
				</ul>
			</div>

			{/* Overview Tab */}
			{activeTab === "overview" && (
				<>
					{/* Summary Cards */}
					<div className="col-12">
						<div className="row g-3">
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-primary bg-opacity-10 rounded p-2 me-3">
											<DollarSign
												size={24}
												className="text-primary"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Total Balance
											</p>
											<p className="h5 fw-bold mb-0">
												{formatCurrency(
													loans.reduce(
														(sum, loan) =>
															sum +
															loan.currentBalance,
														0
													)
												)}
											</p>
										</div>
									</div>
								</Card>
							</div>
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-success bg-opacity-10 rounded p-2 me-3">
											<Calendar
												size={24}
												className="text-success"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Monthly Payment
											</p>
											<p className="h5 fw-bold mb-0">
												{formatCurrency(
													loans.reduce(
														(sum, loan) =>
															sum +
															loan.monthlyPayment,
														0
													)
												)}
											</p>
										</div>
									</div>
								</Card>
							</div>
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-info bg-opacity-10 rounded p-2 me-3">
											<CreditCard
												size={24}
												className="text-info"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Active Loans
											</p>
											<p className="h5 fw-bold mb-0">
												{loans.length}
											</p>
										</div>
									</div>
								</Card>
							</div>
							<div className="col-md-3">
								<Card>
									<div className="d-flex align-items-center">
										<div className="bg-warning bg-opacity-10 rounded p-2 me-3">
											<TrendingUp
												size={24}
												className="text-warning"
											/>
										</div>
										<div>
											<p className="small text-muted mb-1">
												Avg Interest
											</p>
											<p className="h5 fw-bold mb-0">
												{(
													loans.reduce(
														(sum, loan) =>
															sum +
															loan.interestRate,
														0
													) / loans.length
												).toFixed(2)}
												%
											</p>
										</div>
									</div>
								</Card>
							</div>
						</div>
					</div>

					{/* Active Loans */}
					<div className="col-12">
						<Card>
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h5 className="fw-medium mb-0">Your Loans</h5>
								<Button
									variant="primary"
									onClick={() => setActiveTab("apply")}
								>
									Apply for Loan
								</Button>
							</div>

							<div className="row g-4">
								{loans.map((loan) => (
									<div key={loan.id} className="col-lg-6">
										<div className="border rounded p-4">
											<div className="d-flex align-items-center justify-content-between mb-3">
												<div className="d-flex align-items-center">
													<div className="bg-light rounded p-2 me-3">
														{getLoanIcon(loan.type)}
													</div>
													<div>
														<h6 className="fw-medium mb-1">
															{loan.name}
														</h6>
														<small className="text-muted">
															{
																loan.remainingMonths
															}{" "}
															payments remaining
														</small>
													</div>
												</div>
												{getStatusBadge(loan.status)}
											</div>

											<div className="row g-3 mb-3">
												<div className="col-6">
													<p className="small text-muted mb-1">
														Current Balance
													</p>
													<p className="fw-semibold mb-0">
														{formatCurrency(
															loan.currentBalance
														)}
													</p>
												</div>
												<div className="col-6">
													<p className="small text-muted mb-1">
														Monthly Payment
													</p>
													<p className="fw-semibold mb-0">
														{formatCurrency(
															loan.monthlyPayment
														)}
													</p>
												</div>
												<div className="col-6">
													<p className="small text-muted mb-1">
														Interest Rate
													</p>
													<p className="fw-semibold mb-0">
														{loan.interestRate}%
													</p>
												</div>
												<div className="col-6">
													<p className="small text-muted mb-1">
														Next Payment
													</p>
													<p className="fw-semibold mb-0">
														{loan.nextPaymentDate}
													</p>
												</div>
											</div>

											<div className="mb-3">
												<div className="d-flex justify-content-between small mb-1">
													<span>Progress</span>
													<span>
														{Math.round(
															((loan.termMonths -
																loan.remainingMonths) /
																loan.termMonths) *
																100
														)}
														%
													</span>
												</div>
												<div
													className="progress"
													style={{ height: "6px" }}
												>
													<div
														className="progress-bar bg-success"
														style={{
															width: `${
																((loan.termMonths -
																	loan.remainingMonths) /
																	loan.termMonths) *
																100
															}%`,
														}}
													></div>
												</div>
											</div>

											<div className="d-flex gap-2">
												<Button
													variant="outline"
													size="sm"
													className="flex-grow-1"
												>
													Make Payment
												</Button>
												<Button
													variant="outline"
													size="sm"
												>
													Details
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</Card>
					</div>
				</>
			)}

			{/* Apply for Loan Tab */}
			{activeTab === "apply" && (
				<div className="col-12">
					<div className="row g-4">
						{loanTypes.map((loanType) => {
							const IconComponent = loanType.icon;
							return (
								<div key={loanType.type} className="col-lg-6">
									<Card className="h-100">
										<div className="d-flex align-items-start mb-3">
											<div className="bg-primary bg-opacity-10 rounded p-3 me-3">
												<IconComponent
													size={32}
													className="text-primary"
												/>
											</div>
											<div className="flex-grow-1">
												<h5 className="fw-medium mb-2">
													{loanType.name}
												</h5>
												<p className="text-muted mb-3">
													{loanType.description}
												</p>
											</div>
										</div>

										<div className="mb-4">
											<div className="row g-2 small">
												<div className="col-4">
													<span className="text-muted">
														Rates:
													</span>
												</div>
												<div className="col-8">
													<span className="fw-medium">
														{loanType.rates}
													</span>
												</div>
												<div className="col-4">
													<span className="text-muted">
														Terms:
													</span>
												</div>
												<div className="col-8">
													<span className="fw-medium">
														{loanType.terms}
													</span>
												</div>
												<div className="col-4">
													<span className="text-muted">
														Max Amount:
													</span>
												</div>
												<div className="col-8">
													<span className="fw-medium">
														{loanType.maxAmount}
													</span>
												</div>
											</div>
										</div>

										<Button
											variant="primary"
											className="w-100"
											onClick={() =>
												handleApplyLoan(loanType.name)
											}
										>
											Apply Now
										</Button>
									</Card>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Calculator Tab */}
			{activeTab === "calculator" && (
				<div className="col-12">
					<div className="row g-4">
						<div className="col-lg-6">
							<Card>
								<h5 className="fw-medium mb-4">
									Loan Calculator
								</h5>
								<div className="row g-3">
									<div className="col-12">
										<label className="form-label">
											Loan Type
										</label>
										<select
											className="form-select"
											value={calculatorValues.type}
											onChange={(e) =>
												setCalculatorValues((prev) => ({
													...prev,
													type: e.target.value,
												}))
											}
										>
											<option value="personal">
												Personal Loan
											</option>
											<option value="auto">
												Auto Loan
											</option>
											<option value="mortgage">
												Mortgage
											</option>
											<option value="student">
												Student Loan
											</option>
										</select>
									</div>
									<div className="col-12">
										<label className="form-label">
											Loan Amount
										</label>
										<div className="input-group">
											<span className="input-group-text">
												$
											</span>
											<Input
												type="number"
												placeholder="0"
												value={calculatorValues.amount}
												onChange={(e) =>
													setCalculatorValues(
														(prev) => ({
															...prev,
															amount: e.target
																.value,
														})
													)
												}
											/>
										</div>
									</div>
									<div className="col-6">
										<label className="form-label">
											Term (months)
										</label>
										<Input
											type="number"
											placeholder="12"
											value={calculatorValues.term}
											onChange={(e) =>
												setCalculatorValues((prev) => ({
													...prev,
													term: e.target.value,
												}))
											}
										/>
									</div>
									<div className="col-6">
										<label className="form-label">
											Interest Rate (%)
										</label>
										<Input
											type="number"
											step="0.01"
											placeholder="5.5"
											value={calculatorValues.rate}
											onChange={(e) =>
												setCalculatorValues((prev) => ({
													...prev,
													rate: e.target.value,
												}))
											}
										/>
									</div>
								</div>
							</Card>
						</div>

						<div className="col-lg-6">
							<Card>
								<h5 className="fw-medium mb-4">
									Payment Estimate
								</h5>
								<div className="text-center py-4">
									<p className="h2 fw-bold text-primary mb-3">
										{formatCurrency(calculatePayment())}
									</p>
									<p className="text-muted mb-4">
										Monthly Payment
									</p>

									{calculatorValues.amount &&
										calculatorValues.term && (
											<div className="row g-3 text-start">
												<div className="col-6">
													<p className="small text-muted mb-1">
														Total Interest
													</p>
													<p className="fw-medium mb-0">
														{formatCurrency(
															calculatePayment() *
																calculatorValues.term -
																calculatorValues.amount
														)}
													</p>
												</div>
												<div className="col-6">
													<p className="small text-muted mb-1">
														Total Amount
													</p>
													<p className="fw-medium mb-0">
														{formatCurrency(
															calculatePayment() *
																calculatorValues.term
														)}
													</p>
												</div>
											</div>
										)}
								</div>
								<Button variant="primary" className="w-100">
									Apply for This Loan
								</Button>
							</Card>
						</div>
					</div>
				</div>
			)}

			{/* Applications Tab */}
			{activeTab === "applications" && (
				<div className="col-12">
					<Card>
						<h5 className="fw-medium mb-4">Your Applications</h5>

						{applications.length > 0 ? (
							<div className="list-group list-group-flush">
								{applications.map((app, index) => (
									<div
										key={app.id}
										className={`list-group-item d-flex align-items-center justify-content-between py-3 ${
											index === applications.length - 1
												? "border-bottom-0"
												: ""
										}`}
									>
										<div className="d-flex align-items-center">
											<div className="bg-light rounded p-2 me-3">
												{getLoanIcon(app.type)}
											</div>
											<div>
												<h6 className="fw-medium mb-1">
													{app.purpose}
												</h6>
												<p className="small text-muted mb-0">
													Submitted:{" "}
													{app.submittedDate}
													{app.expectedDecision &&
														` • Decision expected: ${app.expectedDecision}`}
													{app.approvedDate &&
														` • Approved: ${app.approvedDate}`}
												</p>
											</div>
										</div>
										<div className="d-flex align-items-center">
											<div className="text-end me-3">
												<p className="fw-medium mb-0">
													{formatCurrency(app.amount)}
												</p>
												{app.rate && (
													<small className="text-muted">
														Rate: {app.rate}%
													</small>
												)}
											</div>
											{getStatusBadge(app.status)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-5">
								<FileText
									size={48}
									className="text-muted mb-3"
								/>
								<h6 className="fw-medium mb-2">
									No Applications
								</h6>
								<p className="text-muted mb-4">
									You haven't submitted any loan applications
									yet
								</p>
								<Button
									variant="primary"
									onClick={() => setActiveTab("apply")}
								>
									Apply for Your First Loan
								</Button>
							</div>
						)}
					</Card>
				</div>
			)}
		</div>
	);
};

export default Loans;
