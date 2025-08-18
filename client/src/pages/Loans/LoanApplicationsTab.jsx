import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { DollarSign, Home, Car, GraduationCap, ArrowLeft } from "lucide-react";
import { loanTypes } from "./loanUtils";
import LoanApplicationForm from "./LoanApplicationForm";

const LoanApplicationsTab = ({ onApplyLoan, loading }) => {
	const [showApplicationForm, setShowApplicationForm] = useState(false);
	const [selectedLoanType, setSelectedLoanType] = useState(null);

	const iconMap = {
		DollarSign,
		Home,
		Car,
		GraduationCap,
	};

	const handleApplyClick = (loanType) => {
		setSelectedLoanType(loanType);
		setShowApplicationForm(true);
	};

	const handleFormSubmit = async (formData) => {
		try {
			await onApplyLoan(formData);
			setShowApplicationForm(false);
			setSelectedLoanType(null);
		} catch (error) {
			// Error handling is done in the parent component
			throw error;
		}
	};

	const handleBack = () => {
		setShowApplicationForm(false);
		setSelectedLoanType(null);
	};

	if (showApplicationForm) {
		return (
			<div className="col-12">
				<div className="d-flex align-items-center mb-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handleBack}
						className="me-3"
					>
						<ArrowLeft size={16} />
					</Button>
					<div>
						<h5 className="fw-medium mb-1">
							Apply for {selectedLoanType?.name || 'Loan'}
						</h5>
						<p className="text-muted mb-0 small">
							Fill out the form below to submit your loan application
						</p>
					</div>
				</div>
				
				<LoanApplicationForm 
					onSubmit={handleFormSubmit}
					loading={loading}
					initialLoanType={selectedLoanType?.type}
				/>
			</div>
		);
	}

	return (
		<div className="col-12">
			<div className="row g-4">
				<div className="col-12">
					<h5 className="fw-medium mb-3">Available Loan Products</h5>
					<p className="text-muted">
						Choose from our competitive loan products designed to meet your financial needs.
					</p>
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
										onClick={() => handleApplyClick(loanType)}
										disabled={loading}
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
