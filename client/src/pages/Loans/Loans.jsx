import { useState } from "react";
import LoansHeader from "./LoansHeader";
import LoansTabs from "./LoansTabs";
import LoansSummary from "./LoansSummary";
import LoansList from "./LoansList";
import LoanCalculator from "./LoanCalculator";
import LoanApplicationsTab from "./LoanApplicationsTab";
import ApplicationsStatusTab from "./ApplicationsStatusTab";
import LoanPaymentModal from "./LoanPaymentModal";
import { useLoans, useLoanApplications } from "../../hooks/useLoans";

const Loans = () => {
	const [activeTab, setActiveTab] = useState("overview");
	const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
	
	// Use custom hooks for loan management
	const {
		loans,
		loanSummary,
		loading,
		error,
		makeLoanPayment,
		createLoanApplication,
		getLoanById,
		fetchLoans,
		fetchLoanSummary
	} = useLoans();

	const {
		applications,
		loading: applicationsLoading,
		fetchApplications
	} = useLoanApplications();

	const handleMakePayment = async (loanId, amount) => {
		// If amount is provided directly, make the payment
		if (amount) {
			try {
				await makeLoanPayment(loanId, amount);
				alert("Payment processed successfully!");
			} catch (err) {
				alert(`Payment failed: ${err.message}`);
			}
		} else {
			// Otherwise, open the payment modal
			const loan = loans.find(l => l.id === loanId);
			if (loan) {
				setSelectedLoanForPayment(loan);
			}
		}
	};

	const handlePaymentModalSubmit = async (loanId, amount) => {
		await makeLoanPayment(loanId, amount);
		setSelectedLoanForPayment(null);
	};

	const handleViewDetails = async (loanId) => {
		try {
			const loanDetails = await getLoanById(loanId);
			console.log("Loan details:", loanDetails);
			// You can implement a modal or navigate to a details page here
			alert("Loan details feature will be implemented soon!");
		} catch (err) {
			alert(`Failed to get loan details: ${err.message}`);
		}
	};

	const handleApplyLoan = async (loanData) => {
		try {
			await createLoanApplication(loanData);
			alert("Loan application submitted successfully!");
			// Refresh all loan data to show the new application everywhere
			await Promise.all([
				fetchLoans(),
				fetchLoanSummary(),
				fetchApplications()
			]);
			// Switch to Applications tab to show the new application
			setActiveTab("applications");
		} catch (err) {
			alert(`Loan application failed: ${err.message}`);
		}
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

	if (error) {
		return (
			<div className="row g-4">
				<div className="col-12">
					<div className="alert alert-danger" role="alert">
						<h4 className="alert-heading">Error Loading Loans</h4>
						<p>{error}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="row g-4">
				<LoansHeader />

				<LoansTabs activeTab={activeTab} onTabChange={setActiveTab} />

				{/* Overview Tab */}
				{activeTab === "overview" && (
					<>
						<LoansSummary 
							loans={loans} 
							summary={loanSummary}
						/>
						<LoansList
							loans={loans}
							onMakePayment={handleMakePayment}
							onViewDetails={handleViewDetails}
						/>
					</>
				)}

				{/* Apply for Loan Tab */}
				{activeTab === "apply" && (
					<LoanApplicationsTab 
						onApplyLoan={handleApplyLoan}
						loading={loading}
					/>
				)}

				{/* Calculator Tab */}
				{activeTab === "calculator" && <LoanCalculator />}

				{/* Applications Tab */}
				{activeTab === "applications" && (
					<ApplicationsStatusTab 
						applications={applications} 
						loading={applicationsLoading}
					/>
				)}
			</div>

			{/* Payment Modal */}
			{selectedLoanForPayment && (
				<LoanPaymentModal
					loan={selectedLoanForPayment}
					onPayment={handlePaymentModalSubmit}
					onClose={() => setSelectedLoanForPayment(null)}
					loading={loading}
				/>
			)}
		</>
	);
};

export default Loans;
