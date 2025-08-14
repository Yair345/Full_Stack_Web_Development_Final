import { DollarSign, Calendar } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency } from "./loanUtils";

const LoansSummary = ({ loans }) => {
	const totalBalance = loans.reduce(
		(sum, loan) => sum + loan.currentBalance,
		0
	);
	const monthlyPayments = loans.reduce(
		(sum, loan) => sum + loan.monthlyPayment,
		0
	);
	const activeLoans = loans.filter(
		(loan) => loan.status === "current"
	).length;

	return (
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
									{formatCurrency(totalBalance)}
								</p>
							</div>
						</div>
					</Card>
				</div>
				<div className="col-md-3">
					<Card>
						<div className="d-flex align-items-center">
							<div className="bg-success bg-opacity-10 rounded p-2 me-3">
								<Calendar size={24} className="text-success" />
							</div>
							<div>
								<p className="small text-muted mb-1">
									Monthly Payments
								</p>
								<p className="h5 fw-bold mb-0">
									{formatCurrency(monthlyPayments)}
								</p>
							</div>
						</div>
					</Card>
				</div>
				<div className="col-md-3">
					<Card>
						<div className="d-flex align-items-center">
							<div className="bg-info bg-opacity-10 rounded p-2 me-3">
								<DollarSign size={24} className="text-info" />
							</div>
							<div>
								<p className="small text-muted mb-1">
									Active Loans
								</p>
								<p className="h5 fw-bold mb-0">{activeLoans}</p>
							</div>
						</div>
					</Card>
				</div>
				<div className="col-md-3">
					<Card>
						<div className="d-flex align-items-center">
							<div className="bg-warning bg-opacity-10 rounded p-2 me-3">
								<Calendar size={24} className="text-warning" />
							</div>
							<div>
								<p className="small text-muted mb-1">
									Next Payment
								</p>
								<p className="h6 fw-bold mb-0">Aug 20, 2025</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default LoansSummary;
