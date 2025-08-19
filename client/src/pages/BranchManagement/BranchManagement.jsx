import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import BranchHeader from "./BranchHeader";
import BranchTabs from "./BranchTabs";
import OverviewTab from "./OverviewTab";
import CustomersTab from "./CustomersTab";
import PendingUsersTab from "./PendingUsersTab";
import LoanApplicationsTab from "./LoanApplicationsTab";
import RejectionModal from "./RejectionModal";
import {
	useBranch,
	useBranchCustomers,
	useBranchLoans,
} from "../../hooks/api/apiHooks";
import { useAuth } from "../../hooks";
import { useLoans } from "../../hooks/useLoans";

const BranchManagement = () => {
	const [activeTab, setActiveTab] = useState("overview");
	const [showRejectionModal, setShowRejectionModal] = useState(false);
	const [selectedLoan, setSelectedLoan] = useState(null);
	const [notification, setNotification] = useState(null);
	const { user } = useAuth();
	const { approveBranchLoan } = useLoans();

	// For this demo, we'll use the first branch or user's branch
	// In a real app, this would be determined by user's role and assignments
	const branchId = user?.branch_id || 1;

	// Fetch branch data
	const {
		data: branchResponse,
		loading: branchLoading,
		error: branchError,
		refetch: refetchBranch,
	} = useBranch(branchId);
	const {
		data: customersResponse,
		loading: customersLoading,
		error: customersError,
		refetch: refetchCustomers,
	} = useBranchCustomers(branchId);
	const {
		data: loansResponse,
		loading: loansLoading,
		error: loansError,
		refetch: refetchLoans,
	} = useBranchLoans(branchId, {}); // Remove status filter to show all loans

	// Extract data from responses
	const branch = branchResponse?.data?.branch;
	const customers = customersResponse?.data?.customers || [];
	const loanApplications = loansResponse?.data?.loans || [];

	const loading = branchLoading;
	const error = branchError;

	const handleRefresh = () => {
		refetchBranch();
		refetchCustomers();
		refetchLoans();
	};

	const showNotification = (type, message) => {
		setNotification({ type, message });
		// Auto hide notification after 5 seconds
		setTimeout(() => {
			setNotification(null);
		}, 5000);
	};

	const handleCustomerAction = (action, customerId) => {
		console.log(`${action} customer:`, customerId);
		alert(`${action} customer action will be implemented soon!`);
	};

	const handleLoanAction = async (action, applicationId) => {
		console.log(`${action} loan application:`, applicationId);

		try {
			if (action === "Approve") {
				await approveBranchLoan(applicationId, "approved");

				// Show success message and refresh data
				const loanData = loanApplications.find(
					(app) => app.id === applicationId
				);
				const customerName =
					loanData?.customerName ||
					(loanData?.borrower
						? `${loanData.borrower.first_name} ${loanData.borrower.last_name}`
						: "Customer");

				showNotification(
					"success",
					`${customerName}'s loan application has been approved successfully! Loan funds have been disbursed to their checking account.`
				);
				refetchLoans(); // Refresh the loan data
			} else if (action === "Reject") {
				// Find the loan data and show rejection modal
				const loan = loanApplications.find(
					(app) => app.id === applicationId
				);
				setSelectedLoan(loan);
				setShowRejectionModal(true);
			} else if (action === "Review") {
				// Navigate to detailed review (to be implemented)
				showNotification(
					"info",
					"Detailed review functionality will be implemented soon!"
				);
			}
		} catch (error) {
			console.error("Loan action failed:", error);
			showNotification(
				"danger",
				`Failed to ${action.toLowerCase()} loan application: ${
					error.message
				}`
			);
		}
	};

	const handleRejectConfirm = async (reason) => {
		if (!selectedLoan) return;

		try {
			await approveBranchLoan(selectedLoan.id, "rejected", reason);

			const customerName =
				selectedLoan.customerName ||
				(selectedLoan.borrower
					? `${selectedLoan.borrower.first_name} ${selectedLoan.borrower.last_name}`
					: "Customer");

			showNotification(
				"warning",
				`${customerName}'s loan application has been rejected.`
			);
			refetchLoans(); // Refresh the loan data
		} catch (error) {
			console.error("Loan rejection failed:", error);
			showNotification(
				"danger",
				`Failed to reject loan application: ${error.message}`
			);
			throw error; // Re-throw to let modal handle loading state
		}
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "overview":
				return <OverviewTab branchInfo={branch} />;
			case "customers":
				return (
					<CustomersTab
						customers={customers}
						loading={customersLoading}
						error={customersError}
						onCustomerAction={handleCustomerAction}
						onRefresh={refetchCustomers}
					/>
				);
			case "pending-users":
				return <PendingUsersTab branchId={branchId} />;
			case "loans":
				return (
					<LoanApplicationsTab
						loanApplications={loanApplications}
						loading={loansLoading}
						error={loansError}
						onLoanAction={handleLoanAction}
						onRefresh={refetchLoans}
					/>
				);
			default:
				return null;
		}
	};

	// Show loading state
	if (loading) {
		return (
			<div className="container-fluid p-4">
				<div className="row g-4">
					<div className="col-12">
						<div className="d-flex justify-content-center py-5">
							<div
								className="spinner-border text-primary"
								role="status"
							>
								<span className="visually-hidden">
									Loading branch data...
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="container-fluid p-4">
				<div className="row g-4">
					<div className="col-12">
						<div
							className="alert alert-danger d-flex align-items-center"
							role="alert"
						>
							<div className="me-3">
								<svg
									width="24"
									height="24"
									fill="currentColor"
									className="bi bi-exclamation-triangle-fill"
								>
									<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
								</svg>
							</div>
							<div className="flex-grow-1">
								<h6 className="mb-1">
									Error Loading Branch Data
								</h6>
								<p className="mb-2">
									{error?.message ||
										"Unable to load branch data. Please try again."}
								</p>
								<button
									className="btn btn-outline-danger btn-sm"
									onClick={handleRefresh}
								>
									Try Again
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container-fluid p-4">
			<div className="row g-4">
				{/* Notification Alert */}
				{notification && (
					<div className="col-12">
						<div
							className={`alert alert-${notification.type} alert-dismissible fade show`}
							role="alert"
						>
							<div className="d-flex align-items-center">
								<div className="me-2">
									{notification.type === "success" && (
										<CheckCircle size={20} />
									)}
									{notification.type === "warning" && (
										<AlertCircle size={20} />
									)}
									{notification.type === "danger" && (
										<XCircle size={20} />
									)}
									{notification.type === "info" && (
										<Info size={20} />
									)}
								</div>
								<div className="flex-grow-1">
									{notification.message}
								</div>
								<button
									type="button"
									className="btn-close"
									onClick={() => setNotification(null)}
									aria-label="Close"
								></button>
							</div>
						</div>
					</div>
				)}

				<BranchHeader branchInfo={branch} onRefresh={handleRefresh} />

				<BranchTabs activeTab={activeTab} onTabChange={setActiveTab} />

				{renderTabContent()}
			</div>

			{/* Rejection Modal */}
			<RejectionModal
				show={showRejectionModal}
				onHide={() => {
					setShowRejectionModal(false);
					setSelectedLoan(null);
				}}
				onConfirm={handleRejectConfirm}
				loanData={selectedLoan}
			/>
		</div>
	);
};

export default BranchManagement;
