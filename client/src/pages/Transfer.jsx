import { useState, useEffect } from "react";
import {
	ArrowRightLeft,
	Users,
	Building,
	Clock,
	CreditCard,
	Send,
	History,
	Plus,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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

	// Mock data
	const mockAccounts = [
		{
			id: 1,
			name: "Checking Account",
			number: "****1234",
			balance: 2500.75,
			type: "checking",
		},
		{
			id: 2,
			name: "Savings Account",
			number: "****5678",
			balance: 15000.0,
			type: "savings",
		},
		{
			id: 3,
			name: "Business Account",
			number: "****9012",
			balance: 8750.25,
			type: "business",
		},
	];

	const mockRecentRecipients = [
		{
			id: 1,
			name: "Sarah Johnson",
			accountNumber: "****4567",
			bank: "Same Bank",
			lastTransfer: "2025-08-12",
			type: "internal",
		},
		{
			id: 2,
			name: "Mike Wilson",
			accountNumber: "****8901",
			bank: "First National Bank",
			lastTransfer: "2025-08-10",
			type: "external",
		},
		{
			id: 3,
			name: "Electric Company",
			accountNumber: "****2345",
			bank: "Business Bank",
			lastTransfer: "2025-08-08",
			type: "bill",
		},
	];

	const mockScheduledTransfers = [
		{
			id: 1,
			recipient: "Savings Account",
			amount: 500.0,
			frequency: "Monthly",
			nextDate: "2025-09-01",
			status: "active",
		},
		{
			id: 2,
			recipient: "Electric Company",
			amount: 120.0,
			frequency: "Monthly",
			nextDate: "2025-08-20",
			status: "active",
		},
		{
			id: 3,
			recipient: "Sarah Johnson",
			amount: 200.0,
			frequency: "Weekly",
			nextDate: "2025-08-18",
			status: "paused",
		},
	];

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

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const handleInputChange = (field, value) => {
		setTransferForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleQuickTransfer = (e) => {
		e.preventDefault();
		console.log("Quick transfer:", transferForm);
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

	const getAccountIcon = (type) => {
		switch (type) {
			case "checking":
				return <CreditCard size={16} className="text-primary" />;
			case "savings":
				return <Building size={16} className="text-success" />;
			case "business":
				return <Building size={16} className="text-warning" />;
			default:
				return <CreditCard size={16} className="text-secondary" />;
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

	return (
		<div className="row g-4">
			{/* Header */}
			<div className="col-12">
				<div>
					<h1 className="h2 fw-bold text-dark mb-1">
						Transfer Money
					</h1>
					<p className="text-muted">
						Send money between accounts or to other recipients
					</p>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="col-12">
				<ul className="nav nav-pills mb-4">
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "quick" ? "active" : ""
							}`}
							onClick={() => setActiveTab("quick")}
						>
							<Send size={16} className="me-2" />
							Quick Transfer
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "recipients" ? "active" : ""
							}`}
							onClick={() => setActiveTab("recipients")}
						>
							<Users size={16} className="me-2" />
							Recipients
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "scheduled" ? "active" : ""
							}`}
							onClick={() => setActiveTab("scheduled")}
						>
							<Clock size={16} className="me-2" />
							Scheduled
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "history" ? "active" : ""
							}`}
							onClick={() => setActiveTab("history")}
						>
							<History size={16} className="me-2" />
							History
						</button>
					</li>
				</ul>
			</div>

			{/* Quick Transfer Tab */}
			{activeTab === "quick" && (
				<>
					<div className="col-lg-8">
						<Card>
							<h5 className="fw-medium mb-4">Send Money</h5>
							<form onSubmit={handleQuickTransfer}>
								<div className="row g-3">
									<div className="col-12">
										<label className="form-label">
											From Account
										</label>
										<select
											className="form-select"
											value={transferForm.fromAccount}
											onChange={(e) =>
												handleInputChange(
													"fromAccount",
													e.target.value
												)
											}
											required
										>
											<option value="">
												Select account
											</option>
											{accounts.map((account) => (
												<option
													key={account.id}
													value={account.id}
												>
													{account.name} (
													{account.number}) -{" "}
													{formatCurrency(
														account.balance
													)}
												</option>
											))}
										</select>
									</div>

									<div className="col-12">
										<label className="form-label">
											Transfer Type
										</label>
										<div
											className="btn-group w-100"
											role="group"
										>
											<input
												type="radio"
												className="btn-check"
												name="transferType"
												id="internal"
												checked={
													transferForm.type ===
													"internal"
												}
												onChange={() =>
													handleInputChange(
														"type",
														"internal"
													)
												}
											/>
											<label
												className="btn btn-outline-primary"
												htmlFor="internal"
											>
												Between My Accounts
											</label>

											<input
												type="radio"
												className="btn-check"
												name="transferType"
												id="external"
												checked={
													transferForm.type ===
													"external"
												}
												onChange={() =>
													handleInputChange(
														"type",
														"external"
													)
												}
											/>
											<label
												className="btn btn-outline-primary"
												htmlFor="external"
											>
												To Another Person
											</label>

											<input
												type="radio"
												className="btn-check"
												name="transferType"
												id="wire"
												checked={
													transferForm.type === "wire"
												}
												onChange={() =>
													handleInputChange(
														"type",
														"wire"
													)
												}
											/>
											<label
												className="btn btn-outline-primary"
												htmlFor="wire"
											>
												Wire Transfer
											</label>
										</div>
									</div>

									<div className="col-12">
										<label className="form-label">
											{transferForm.type === "internal"
												? "To Account"
												: "Recipient Account"}
										</label>
										{transferForm.type === "internal" ? (
											<select
												className="form-select"
												value={transferForm.toAccount}
												onChange={(e) =>
													handleInputChange(
														"toAccount",
														e.target.value
													)
												}
												required
											>
												<option value="">
													Select account
												</option>
												{accounts
													.filter(
														(acc) =>
															acc.id.toString() !==
															transferForm.fromAccount
													)
													.map((account) => (
														<option
															key={account.id}
															value={account.id}
														>
															{account.name} (
															{account.number})
														</option>
													))}
											</select>
										) : (
											<Input
												type="text"
												placeholder="Enter account number or email"
												value={transferForm.toAccount}
												onChange={(e) =>
													handleInputChange(
														"toAccount",
														e.target.value
													)
												}
												required
											/>
										)}
									</div>

									<div className="col-md-6">
										<label className="form-label">
											Amount
										</label>
										<div className="input-group">
											<span className="input-group-text">
												$
											</span>
											<Input
												type="number"
												step="0.01"
												min="0.01"
												placeholder="0.00"
												value={transferForm.amount}
												onChange={(e) =>
													handleInputChange(
														"amount",
														e.target.value
													)
												}
												required
											/>
										</div>
									</div>

									<div className="col-md-6">
										<label className="form-label">
											When
										</label>
										<select className="form-select">
											<option value="now">
												Send Now
											</option>
											<option value="scheduled">
												Schedule for Later
											</option>
										</select>
									</div>

									<div className="col-12">
										<label className="form-label">
											Description (Optional)
										</label>
										<Input
											type="text"
											placeholder="What's this for?"
											value={transferForm.description}
											onChange={(e) =>
												handleInputChange(
													"description",
													e.target.value
												)
											}
										/>
									</div>

									<div className="col-12">
										<div className="d-flex gap-3">
											<Button
												type="submit"
												variant="primary"
												className="flex-grow-1"
											>
												<ArrowRightLeft
													size={16}
													className="me-2"
												/>
												Send Transfer
											</Button>
											<Button
												type="button"
												variant="outline"
											>
												Save as Template
											</Button>
										</div>
									</div>
								</div>
							</form>
						</Card>
					</div>

					<div className="col-lg-4">
						<Card>
							<h6 className="fw-medium mb-3">Transfer Limits</h6>
							<div className="mb-3">
								<div className="d-flex justify-content-between small mb-1">
									<span>Daily Limit</span>
									<span>$2,500</span>
								</div>
								<div
									className="progress"
									style={{ height: "4px" }}
								>
									<div
										className="progress-bar"
										style={{ width: "30%" }}
									></div>
								</div>
								<small className="text-muted">
									$750 used today
								</small>
							</div>
							<div className="mb-3">
								<div className="d-flex justify-content-between small mb-1">
									<span>Monthly Limit</span>
									<span>$25,000</span>
								</div>
								<div
									className="progress"
									style={{ height: "4px" }}
								>
									<div
										className="progress-bar"
										style={{ width: "20%" }}
									></div>
								</div>
								<small className="text-muted">
									$5,200 used this month
								</small>
							</div>
						</Card>

						<Card>
							<h6 className="fw-medium mb-3">Security Notice</h6>
							<div className="alert alert-info p-3">
								<small>
									• Transfers between your accounts are
									instant
									<br />
									• External transfers may take 1-3 business
									days
									<br />
									• Wire transfers are typically processed
									same day
									<br />• Always verify recipient details
									before sending
								</small>
							</div>
						</Card>
					</div>
				</>
			)}

			{/* Recipients Tab */}
			{activeTab === "recipients" && (
				<div className="col-12">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h5 className="fw-medium mb-0">Recent Recipients</h5>
						<Button variant="primary">
							<Plus size={16} className="me-2" />
							Add Recipient
						</Button>
					</div>

					<div className="row g-3">
						{recentRecipients.map((recipient) => (
							<div
								key={recipient.id}
								className="col-md-6 col-lg-4"
							>
								<Card
									className="h-100 cursor-pointer hover-bg-light"
									onClick={() =>
										handleRecipientSelect(recipient)
									}
								>
									<div className="d-flex align-items-center mb-3">
										<div className="bg-light rounded-circle p-2 me-3">
											<Users
												size={20}
												className="text-muted"
											/>
										</div>
										<div className="flex-grow-1">
											<h6 className="fw-medium mb-1">
												{recipient.name}
											</h6>
											<small className="text-muted">
												{recipient.bank}
											</small>
										</div>
									</div>
									<div className="d-flex justify-content-between align-items-center">
										<small className="text-muted">
											{recipient.accountNumber}
										</small>
										<small className="text-muted">
											Last: {recipient.lastTransfer}
										</small>
									</div>
								</Card>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Scheduled Transfers Tab */}
			{activeTab === "scheduled" && (
				<div className="col-12">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h5 className="fw-medium mb-0">Scheduled Transfers</h5>
						<Button variant="primary">
							<Plus size={16} className="me-2" />
							Schedule Transfer
						</Button>
					</div>

					<Card>
						<div className="list-group list-group-flush">
							{scheduledTransfers.map((transfer, index) => (
								<div
									key={transfer.id}
									className={`list-group-item d-flex align-items-center justify-content-between py-3 ${
										index === scheduledTransfers.length - 1
											? "border-bottom-0"
											: ""
									}`}
								>
									<div className="d-flex align-items-center">
										<div className="bg-light rounded-circle p-2 me-3">
											<Clock
												size={20}
												className="text-muted"
											/>
										</div>
										<div>
											<h6 className="fw-medium mb-1">
												{transfer.recipient}
											</h6>
											<small className="text-muted">
												{transfer.frequency} • Next:{" "}
												{transfer.nextDate}
											</small>
										</div>
									</div>
									<div className="d-flex align-items-center">
										<div className="text-end me-3">
											<p className="fw-medium mb-0">
												{formatCurrency(
													transfer.amount
												)}
											</p>
											<span
												className={`badge ${
													transfer.status === "active"
														? "bg-success"
														: "bg-warning"
												}`}
											>
												{transfer.status}
											</span>
										</div>
										<div className="dropdown">
											<button
												className="btn btn-outline-secondary btn-sm"
												data-bs-toggle="dropdown"
											>
												•••
											</button>
											<ul className="dropdown-menu">
												<li>
													<button className="dropdown-item">
														Edit
													</button>
												</li>
												<li>
													<button className="dropdown-item">
														{transfer.status ===
														"active"
															? "Pause"
															: "Resume"}
													</button>
												</li>
												<li>
													<hr className="dropdown-divider" />
												</li>
												<li>
													<button className="dropdown-item text-danger">
														Delete
													</button>
												</li>
											</ul>
										</div>
									</div>
								</div>
							))}
						</div>
					</Card>
				</div>
			)}

			{/* History Tab */}
			{activeTab === "history" && (
				<div className="col-12">
					<Card>
						<div className="text-center py-5">
							<History size={48} className="text-muted mb-3" />
							<h5 className="fw-medium mb-2">Transfer History</h5>
							<p className="text-muted mb-4">
								View your transfer history and receipts
							</p>
							<Button variant="outline">
								View All Transfers
							</Button>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
};

export default Transfer;
