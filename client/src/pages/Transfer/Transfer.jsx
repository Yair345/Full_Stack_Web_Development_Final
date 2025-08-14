import { useState, useEffect } from "react";
import TransferHeader from "./TransferHeader";
import TransferTabs from "./TransferTabs";
import QuickTransferForm from "./QuickTransferForm";
import TransferLimits from "./TransferLimits";
import RecipientsTab from "./RecipientsTab";
import ScheduledTransfersTab from "./ScheduledTransfersTab";
import TransferHistoryTab from "./TransferHistoryTab";
import {
	mockAccounts,
	mockRecentRecipients,
	mockScheduledTransfers,
} from "./transferUtils";

const Transfer = () => {
	const [accounts, setAccounts] = useState([]);
	const [recentRecipients, setRecentRecipients] = useState([]);
	const [scheduledTransfers, setScheduledTransfers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("quick");
	const [transferForm, setTransferForm] = useState({
		fromAccount: "",
		toAccount: "",
		amount: "",
		description: "",
		type: "internal", // internal, external, wire
	});

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				// Simulate network delay
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setAccounts(mockAccounts);
				setRecentRecipients(mockRecentRecipients);
				setScheduledTransfers(mockScheduledTransfers);
			} catch (err) {
				console.error("Error loading transfer data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const handleInputChange = (field, value) => {
		setTransferForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleQuickTransfer = (transferData) => {
		console.log("Quick transfer:", transferData);
		alert("Transfer initiated! (Demo mode)");
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
		console.log("Adding new recipient...");
		alert("Add recipient feature will be implemented soon!");
	};

	const handleScheduleTransfer = () => {
		console.log("Scheduling new transfer...");
		alert("Schedule transfer feature will be implemented soon!");
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
			<TransferHeader />

			<TransferTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Quick Transfer Tab */}
			{activeTab === "quick" && (
				<>
					<QuickTransferForm
						accounts={accounts}
						transferForm={transferForm}
						onInputChange={handleInputChange}
						onSubmit={handleQuickTransfer}
					/>
					<TransferLimits />
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
				/>
			)}

			{/* History Tab */}
			{activeTab === "history" && <TransferHistoryTab />}
		</div>
	);
};

export default Transfer;
