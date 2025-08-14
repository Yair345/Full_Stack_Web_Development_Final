import { useState, useEffect } from "react";
import LoansHeader from "./LoansHeader";
import LoansTabs from "./LoansTabs";
import LoansSummary from "./LoansSummary";
import LoansList from "./LoansList";
import LoanCalculator from "./LoanCalculator";
import LoanApplicationsTab from "./LoanApplicationsTab";
import ApplicationsStatusTab from "./ApplicationsStatusTab";
import { mockLoans, mockApplications } from "./loanUtils";

const Loans = () => {
	const [loans, setLoans] = useState([]);
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");

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

	const handleMakePayment = (loanId) => {
		console.log("Make payment for loan:", loanId);
		alert("Payment feature will be implemented soon!");
	};

	const handleViewDetails = (loanId) => {
		console.log("View details for loan:", loanId);
		alert("Loan details feature will be implemented soon!");
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
			<LoansHeader />

			<LoansTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Overview Tab */}
			{activeTab === "overview" && (
				<>
					<LoansSummary loans={loans} />
					<LoansList
						loans={loans}
						onMakePayment={handleMakePayment}
						onViewDetails={handleViewDetails}
					/>
				</>
			)}

			{/* Apply for Loan Tab */}
			{activeTab === "apply" && (
				<LoanApplicationsTab onApplyLoan={handleApplyLoan} />
			)}

			{/* Calculator Tab */}
			{activeTab === "calculator" && <LoanCalculator />}

			{/* Applications Tab */}
			{activeTab === "applications" && (
				<ApplicationsStatusTab applications={applications} />
			)}
		</div>
	);
};

export default Loans;
