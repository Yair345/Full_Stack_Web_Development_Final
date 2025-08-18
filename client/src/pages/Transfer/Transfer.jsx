import { useState, useEffect } from "react";
import TransferHeader from "./TransferHeader";
import TransferTabs from "./TransferTabs";
import QuickTransferForm from "./QuickTransferForm";
import TransferLimits from "./TransferLimits";
import RecipientsTab from "./RecipientsTab";
import ScheduledTransfersTab from "./ScheduledTransfersTab";
import TransferHistoryTab from "./TransferHistoryTab";
import {
	useAccounts,
	useCreateTransfer,
	useTransactions,
	useStandingOrders,
	useRecentRecipients,
	useCreateStandingOrder,
} from "../../hooks/api/apiHooks";
import { transformServerAccountsForTransfer } from "./transferUtils";

const Transfer = () => {
	// Fetch user accounts from server
	const {
		accounts: rawAccounts,
		loading: accountsLoading,
		error: accountsError,
		refetch: refetchAccounts,
	} = useAccounts();

	// Transform accounts for transfer UI
	const accounts = transformServerAccountsForTransfer(rawAccounts || []);

	// Transfer mutation
	const {
		mutate: createTransfer,
		loading: transferLoading,
		error: transferError,
	} = useCreateTransfer();

	// Fetch transaction history for the history tab
	const {
		transactions: transferHistory,
		loading: historyLoading,
		refetch: refetchHistory,
	} = useTransactions({
		type: "transfer",
	});

	// Fetch standing orders (scheduled transfers)
	const {
		standingOrders: scheduledTransfers,
		loading: scheduledLoading,
		refetch: refetchScheduled,
	} = useStandingOrders();

	// Create a wrapper function for refetchScheduled
	const handleRefreshScheduled = async () => {
		try {
			await refetchScheduled();
		} catch (error) {
			console.error("Failed to refresh scheduled transfers:", error);
		}
	};

	// Fetch recent recipients from transaction history
	const { recipients: recentRecipients, loading: recipientsLoading } =
		useRecentRecipients();

	// Create standing order mutation
	const {
		mutate: createStandingOrder,
		loading: createScheduledLoading,
		error: createScheduledError,
	} = useCreateStandingOrder();

	const [activeTab, setActiveTab] = useState("quick");
	const [transferForm, setTransferForm] = useState({
		fromAccount: "",
		toAccount: "",
		amount: "",
		description: "",
		type: "internal", // internal, external, wire
	});

	// Notification state
	const [notification, setNotification] = useState({
		show: false,
		message: "",
		type: "success",
	});

	// Show notification for 5 seconds
	const showNotification = (message, type = "success") => {
		setNotification({ show: true, message, type });
		setTimeout(() => {
			setNotification({ show: false, message: "", type: "success" });
		}, 5000);
	};

	const handleInputChange = (field, value) => {
		setTransferForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleQuickTransfer = async (transferData) => {
		try {
			// Find the from account to get its ID
			const fromAccount = accounts.find(
				(acc) => acc.id.toString() === transferData.fromAccount
			);
			if (!fromAccount) {
				throw new Error("Source account not found");
			}

			// Prepare transfer request based on transfer type
			let transferRequest;

			if (transferData.type === "internal") {
				// Internal transfer between user's accounts
				const toAccount = accounts.find(
					(acc) => acc.id.toString() === transferData.toAccount
				);
				if (!toAccount) {
					throw new Error("Destination account not found");
				}

				transferRequest = {
					from_account_id: parseInt(transferData.fromAccount),
					to_account_number: toAccount.fullNumber, // Use full account number for consistency
					amount: parseFloat(transferData.amount),
					description: transferData.description || "",
					transfer_type: "internal",
				};
			} else {
				// External transfer to another person/bank
				transferRequest = {
					from_account_id: parseInt(transferData.fromAccount),
					to_account_number: transferData.toAccount, // Already the account number/email for external
					amount: parseFloat(transferData.amount),
					description: transferData.description || "",
					transfer_type:
						transferData.type === "wire" ? "wire" : "external",
				};
			}

			const result = await createTransfer(transferRequest);

			// Show simple success message from server
			const message =
				result.message || "Transfer completed successfully!";
			showNotification(message, "success");

			// Clear the form
			setTransferForm({
				fromAccount: "",
				toAccount: "",
				amount: "",
				description: "",
				type: "internal",
			});

			// Refresh accounts data to update balances
			refetchAccounts();

			// Refresh transfer history
			refetchHistory();
		} catch (error) {
			console.error("Transfer error:", error);
			alert(`Transfer failed: ${error.message || "Unknown error"}`);
		}
	};

	const handleRecipientSelect = (recipient) => {
		setTransferForm((prev) => ({
			...prev,
			toAccount: recipient.accountNumber,
			type: recipient.type,
		}));
		setActiveTab("quick");
	};

	const handleAddRecipient = () => {
		alert("Add recipient feature will be implemented soon!");
	};

	const handleScheduleTransfer = (scheduleData) => {
		if (scheduleData) {
			// Handle actual scheduling with provided data
			createStandingOrder(scheduleData, {
				onSuccess: (data) => {
					showNotification(
						"Scheduled transfer created successfully!",
						"success"
					);
					refetchScheduled();
				},
				onError: (error) => {
					console.error(
						"Failed to create scheduled transfer:",
						error
					);
					showNotification(
						`Failed to create scheduled transfer: ${
							error.message || "Unknown error"
						}`,
						"error"
					);
				},
			});
		} else {
			// Just show a placeholder for now - in real app, would open a modal/form
			showNotification(
				"Schedule transfer form will be implemented soon!",
				"error"
			);
		}
	};

	if (accountsLoading) {
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

	if (accountsError) {
		return (
			<div className="row g-4">
				<div className="col-12">
					<div className="alert alert-danger" role="alert">
						<h4 className="alert-heading">
							Error Loading Accounts
						</h4>
						<p>
							{accountsError.message ||
								"Failed to load accounts. Please try again."}
						</p>
						<button
							className="btn btn-outline-danger"
							onClick={refetchAccounts}
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="row g-4">
			{/* Notification Display */}
			{notification.show && (
				<div className="col-12">
					<div
						className={`alert alert-${
							notification.type === "success"
								? "success"
								: "danger"
						} alert-dismissible fade show`}
						role="alert"
					>
						<strong>
							{notification.type === "success"
								? "✅ Success!"
								: "❌ Error!"}
						</strong>{" "}
						{notification.message}
						<button
							type="button"
							className="btn-close"
							onClick={() =>
								setNotification({
									show: false,
									message: "",
									type: "success",
								})
							}
							aria-label="Close"
						></button>
					</div>
				</div>
			)}

			<TransferHeader />

			<TransferTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Quick Transfer Tab */}
			{activeTab === "quick" && (
				<>
					<QuickTransferForm
						accounts={accounts || []}
						transferForm={transferForm}
						onInputChange={handleInputChange}
						onSubmit={handleQuickTransfer}
						loading={transferLoading}
						error={transferError}
					/>
					<TransferLimits
						selectedAccount={accounts.find(
							(acc) =>
								acc.id.toString() === transferForm.fromAccount
						)}
						currentAmount={transferForm.amount}
					/>
				</>
			)}

			{/* Recipients Tab */}
			{activeTab === "recipients" && (
				<RecipientsTab
					recipients={recentRecipients}
					onRecipientSelect={handleRecipientSelect}
					onAddRecipient={handleAddRecipient}
				/>
			)}

			{/* Scheduled Transfers Tab */}
			{activeTab === "scheduled" && (
				<ScheduledTransfersTab
					scheduledTransfers={scheduledTransfers}
					onScheduleTransfer={handleScheduleTransfer}
					accounts={accounts}
					loading={scheduledLoading || createScheduledLoading}
					onRefresh={handleRefreshScheduled}
				/>
			)}

			{/* History Tab */}
			{activeTab === "history" && (
				<TransferHistoryTab
					transactions={transferHistory || []}
					loading={historyLoading}
				/>
			)}
		</div>
	);
};

export default Transfer;
