import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { DollarSign, Home, Car, GraduationCap } from "lucide-react";
import { loanTypes } from "./loanUtils";

const LoanApplicationsTab = ({ onApplyLoan }) => {
	const iconMap = {
		DollarSign,
		Home,
		Car,
		GraduationCap,
	};

	return (
		<div className="col-12">
			<div className="row g-4">
				<div className="col-12">
					<h5 className="fw-medium mb-3">Available Loan Products</h5>
				</div>

				{loanTypes.map((loanType) => {
					const IconComponent = iconMap[loanType.icon] || DollarSign;
					return (
						<div key={loanType.type} className="col-lg-6">
							<Card className="h-100">
								<div className="d-flex align-items-center mb-3">
									<div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
										<IconComponent
											size={24}
											className="text-primary"
										/>
									</div>
									<div>
										<h6 className="fw-medium mb-1">
											{loanType.name}
										</h6>
										<small className="text-success fw-medium">
											{loanType.rates}
										</small>
									</div>
								</div>

								<p className="text-muted mb-3">
									{loanType.description}
								</p>

								<div className="row g-2 mb-4 small">
									<div className="col-6">
										<span className="text-muted">
											Terms:
										</span>
									</div>
									<div className="col-6">
										<span className="fw-medium">
											{loanType.terms}
										</span>
									</div>
									<div className="col-6">
										<span className="text-muted">
											Max Amount:
										</span>
									</div>
									<div className="col-6">
										<span className="fw-medium">
											{loanType.maxAmount}
										</span>
									</div>
								</div>

								<div className="mt-auto">
									<Button
										variant="primary"
										className="w-100"
										onClick={() =>
											onApplyLoan(loanType.name)
										}
									>
										Apply Now
									</Button>
								</div>
							</Card>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default LoanApplicationsTab;
