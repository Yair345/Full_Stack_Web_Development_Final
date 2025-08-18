import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { DollarSign, Home, Car, GraduationCap } from "lucide-react";
import {
	formatCurrency,
	getLoanIcon,
	getStatusBadge,
	calculateProgress,
} from "./loanUtils";

const LoanItem = ({ loan, onMakePayment, onViewDetails }) => {
	// התאמה לנתונים האמיתיים מה-API
	const originalAmount = parseFloat(loan.amount || loan.originalAmount || 0);
	const currentBalance = parseFloat(
		loan.remainingBalance || loan.currentBalance || originalAmount
	);
	const monthlyPayment = parseFloat(
		loan.monthlyPayment || loan.calculateMonthlyPayment || 0
	);
	const interestRate = loan.interest_rate
		? (parseFloat(loan.interest_rate) * 100).toFixed(2)
		: loan.interestRate
		? parseFloat(loan.interestRate).toFixed(2)
		: "0.00";
	const loanType = loan.loan_type || loan.type || "personal";
	const loanName = loan.purpose
		? `${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan`
		: loan.name ||
		  `${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan`;
	const nextPaymentDate = loan.nextPaymentDue
		? new Date(loan.nextPaymentDue).toLocaleDateString()
		: loan.nextPaymentDate || null;
	const remainingMonths = (loan.term_months || 0) - (loan.payments_made || 0);

	const progress =
		originalAmount > 0
			? calculateProgress(originalAmount, currentBalance)
			: 0;

	const iconName = getLoanIcon(loanType);
	const iconMap = {
		DollarSign,
		Home,
		Car,
		GraduationCap,
	};
	const IconComponent = iconMap[iconName] || DollarSign;
	const statusInfo = getStatusBadge(loan.status);

	// בדיקה אם הלוואה פעילה לתשלום
	const canMakePayment =
		loan.status === "active" || loan.status === "current";
	const isOverdue = loan.isOverdue;

	return (
		<Card>
			<div className="d-flex justify-content-between align-items-start mb-3">
				<div className="d-flex align-items-center">
					<div className="bg-light rounded-circle p-2 me-3">
						<IconComponent size={20} />
					</div>
					<div>
						<h6 className="fw-medium mb-1">{loanName}</h6>
						<small className="text-muted">
							{nextPaymentDate
								? `Next payment: ${nextPaymentDate}`
								: "No active payments"}
							{isOverdue && (
								<span className="text-danger ms-1">
									(Overdue)
								</span>
							)}
						</small>
					</div>
				</div>
				<span className={`badge ${statusInfo.class}`}>
					{statusInfo.text}
				</span>
			</div>

			<div className="row g-2 mb-3 small">
				<div className="col-6">
					<span className="text-muted">Current Balance:</span>
				</div>
				<div className="col-6 text-end">
					<span className="fw-bold">
						{formatCurrency(currentBalance)}
					</span>
				</div>
				<div className="col-6">
					<span className="text-muted">Monthly Payment:</span>
				</div>
				<div className="col-6 text-end">
					<span className="fw-medium">
						{formatCurrency(monthlyPayment)}
					</span>
				</div>
				<div className="col-6">
					<span className="text-muted">Interest Rate:</span>
				</div>
				<div className="col-6 text-end">
					<span className="fw-medium">{interestRate}%</span>
				</div>
				<div className="col-6">
					<span className="text-muted">Remaining Term:</span>
				</div>
				<div className="col-6 text-end">
					<span className="fw-medium">
						{Math.max(0, remainingMonths)} months
					</span>
				</div>
				{(loan.progressPercentage || loan.progressPercentage === 0) && (
					<>
						<div className="col-6">
							<span className="text-muted">Progress:</span>
						</div>
						<div className="col-6 text-end">
							<span className="fw-medium">
								{parseFloat(
									loan.progressPercentage || 0
								).toFixed(1)}
								%
							</span>
						</div>
					</>
				)}
			</div>

			<div className="mb-3">
				<div className="d-flex justify-content-between small mb-1">
					<span>Loan Progress</span>
					<span>{(progress || 0).toFixed(1)}% paid</span>
				</div>
				<div className="progress" style={{ height: "6px" }}>
					<div
						className="progress-bar bg-success"
						style={{
							width: `${Math.max(
								0,
								Math.min(100, progress || 0)
							)}%`,
						}}
					></div>
				</div>
			</div>

			<div className="d-flex gap-2">
				<Button
					variant={isOverdue ? "danger" : "primary"}
					size="sm"
					className="flex-grow-1"
					onClick={() => onMakePayment(loan.id, monthlyPayment)}
					disabled={!canMakePayment}
				>
					{isOverdue ? "Pay Overdue" : "Make Payment"}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onViewDetails(loan.id)}
				>
					View Details
				</Button>
			</div>
		</Card>
	);
};

export default LoanItem;
