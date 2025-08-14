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
	const progress = calculateProgress(
		loan.originalAmount,
		loan.currentBalance
	);

	const iconName = getLoanIcon(loan.type);
	const iconMap = {
		DollarSign,
		Home,
		Car,
		GraduationCap,
	};
	const IconComponent = iconMap[iconName] || DollarSign;
	const statusInfo = getStatusBadge(loan.status);

	return (
		<Card>
			<div className="d-flex justify-content-between align-items-start mb-3">
				<div className="d-flex align-items-center">
					<div className="bg-light rounded-circle p-2 me-3">
						<IconComponent size={20} />
					</div>
					<div>
						<h6 className="fw-medium mb-1">{loan.name}</h6>
						<small className="text-muted">
							Next payment: {loan.nextPaymentDate}
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
						{formatCurrency(loan.currentBalance)}
					</span>
				</div>
				<div className="col-6">
					<span className="text-muted">Monthly Payment:</span>
				</div>
				<div className="col-6 text-end">
					<span className="fw-medium">
						{formatCurrency(loan.monthlyPayment)}
					</span>
				</div>
				<div className="col-6">
					<span className="text-muted">Interest Rate:</span>
				</div>
				<div className="col-6 text-end">
					<span className="fw-medium">{loan.interestRate}%</span>
				</div>
				<div className="col-6">
					<span className="text-muted">Remaining Term:</span>
				</div>
				<div className="col-6 text-end">
					<span className="fw-medium">
						{loan.remainingMonths} months
					</span>
				</div>
			</div>

			<div className="mb-3">
				<div className="d-flex justify-content-between small mb-1">
					<span>Loan Progress</span>
					<span>{progress.toFixed(1)}% paid</span>
				</div>
				<div className="progress" style={{ height: "6px" }}>
					<div
						className="progress-bar bg-success"
						style={{ width: `${progress}%` }}
					></div>
				</div>
			</div>

			<div className="d-flex gap-2">
				<Button
					variant="primary"
					size="sm"
					className="flex-grow-1"
					onClick={() => onMakePayment(loan.id)}
				>
					Make Payment
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
