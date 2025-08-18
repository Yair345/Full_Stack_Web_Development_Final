import { useState } from "react";
import {
	Plus,
	Clock,
	Play,
	Pause,
	Edit,
	Trash2,
	MoreHorizontal,
	ArrowLeft,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ScheduleTransferForm from "./ScheduleTransferForm";
import { formatCurrency } from "./transferUtils";
import {
	useToggleStandingOrder,
	useCancelStandingOrder,
	useUpdateStandingOrder,
} from "../../hooks/api/apiHooks";

const ScheduledTransfersTab = ({
	scheduledTransfers,
	onScheduleTransfer,
	accounts = [],
	loading = false,
	onRefresh,
}) => {
	const [showForm, setShowForm] = useState(false);
	const [editingTransfer, setEditingTransfer] = useState(null);

	// Hooks for managing standing orders
	const { mutate: toggleStandingOrder, loading: toggleLoading } =
		useToggleStandingOrder();

	const { mutate: cancelStandingOrder, loading: cancelLoading } =
		useCancelStandingOrder();

	const { mutate: updateStandingOrder, loading: updateLoading } =
		useUpdateStandingOrder();

	const handleToggleStatus = async (transferId, currentStatus) => {
		try {
			// Call the mutation and wait for it to complete
			const result = await toggleStandingOrder(transferId);

			// Force refresh the list to show updated status
			if (onRefresh) {
				await onRefresh();
			}
		} catch (error) {
			console.error("Toggle standing order error:", error);
			alert(
				`Failed to ${
					currentStatus === "active" ? "pause" : "resume"
				} transfer: ${error.message || "Unknown error"}`
			);
		}
	};

	const handleEditTransfer = (transfer) => {
		setEditingTransfer(transfer);
		setShowForm(true);
	};

	const handleDeleteTransfer = async (transferId) => {
		if (
			window.confirm(
				"Are you sure you want to delete this scheduled transfer?"
			)
		) {
			try {
				await cancelStandingOrder(transferId, {
					onSuccess: () => {
						if (onRefresh) onRefresh();
					},
					onError: (error) => {
						console.error(
							"Failed to delete standing order:",
							error
						);
						alert(
							`Failed to delete transfer: ${
								error.message || "Unknown error"
							}`
						);
					},
				});
			} catch (error) {
				console.error("Delete standing order error:", error);
			}
		}
	};

	const handleCreateSchedule = () => {
		setEditingTransfer(null);
		setShowForm(true);
	};

	const handleFormSubmit = async (scheduleData) => {
		try {
			if (editingTransfer) {
				// Update existing standing order
				await updateStandingOrder(
					{ id: editingTransfer.id, data: scheduleData },
					{
						onSuccess: () => {
							setShowForm(false);
							setEditingTransfer(null);
							if (onRefresh) onRefresh();
						},
						onError: (error) => {
							console.error(
								"Failed to update standing order:",
								error
							);
							throw error;
						},
					}
				);
			} else {
				// Create new standing order
				await onScheduleTransfer(scheduleData);
				setShowForm(false);
				// Refresh the scheduled transfers list
				if (onRefresh) onRefresh();
			}
		} catch (error) {
			// Error is handled in the form component
			throw error;
		}
	};

	const handleFormCancel = () => {
		setShowForm(false);
		setEditingTransfer(null);
	};

	const getFrequencyColor = (frequency) => {
		switch (frequency.toLowerCase()) {
			case "daily":
				return "text-info";
			case "weekly":
				return "text-success";
			case "monthly":
				return "text-primary";
			case "yearly":
				return "text-warning";
			default:
				return "text-muted";
		}
	};

	const isUpcoming = (dateString) => {
		const date = new Date(dateString);
		const today = new Date();
		const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
		return diffDays <= 7 && diffDays >= 0; // Next 7 days
	};

	// Show form when creating or editing
	if (showForm) {
		return (
			<div className="col-12">
				<div className="d-flex align-items-center mb-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handleFormCancel}
						className="me-3"
					>
						<ArrowLeft size={16} className="me-2" />
						Back
					</Button>
					<div>
						<h5 className="fw-medium mb-1">
							{editingTransfer
								? "Edit Scheduled Transfer"
								: "Schedule New Transfer"}
						</h5>
						<p className="text-muted small mb-0">
							Set up automatic recurring transfers
						</p>
					</div>
				</div>

				<ScheduleTransferForm
					accounts={accounts}
					onSubmit={handleFormSubmit}
					onCancel={handleFormCancel}
					loading={updateLoading}
					initialData={editingTransfer}
				/>
			</div>
		);
	}

	if (!scheduledTransfers || scheduledTransfers.length === 0) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<Clock size={48} className="text-muted mb-3" />
						<h5 className="fw-medium mb-2">
							No Scheduled Transfers
						</h5>
						<p className="text-muted mb-4">
							Set up automatic transfers to save time and never
							miss a payment
						</p>
						<Button
							variant="primary"
							onClick={handleCreateSchedule}
						>
							<Plus size={16} className="me-2" />
							Schedule Your First Transfer
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h5 className="fw-medium mb-1">Scheduled Transfers</h5>
					<p className="text-muted small mb-0">
						Manage your automatic and recurring transfers
					</p>
				</div>
				<Button variant="primary" onClick={handleCreateSchedule}>
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
							} ${
								transfer.status === "active" &&
								isUpcoming(transfer.nextDate)
									? "border-start border-primary border-3"
									: ""
							} ${
								transfer.status === "paused"
									? "bg-warning bg-opacity-10"
									: ""
							}`}
						>
							<div className="d-flex align-items-center">
								<div
									className={`rounded-circle p-2 me-3 ${
										transfer.status === "active"
											? "bg-primary bg-opacity-10"
											: "bg-warning bg-opacity-10"
									}`}
								>
									{transfer.status === "active" ? (
										<Clock
											size={20}
											className="text-primary"
										/>
									) : (
										<Pause
											size={20}
											className="text-warning"
										/>
									)}
								</div>
								<div>
									<h6 className="fw-medium mb-1">
										{transfer.recipient}
										{transfer.status === "paused" && (
											<span className="ms-2 badge bg-warning text-dark">
												PAUSED
											</span>
										)}
									</h6>
									<div className="d-flex align-items-center text-muted small">
										<span
											className={getFrequencyColor(
												transfer.frequency
											)}
										>
											{transfer.frequency}
										</span>
										<span className="mx-2">•</span>
										<span>
											Next:{" "}
											{new Date(
												transfer.nextDate
											).toLocaleDateString()}
										</span>
										{transfer.status === "paused" && (
											<>
												<span className="mx-2">•</span>
												<span className="text-warning small">
													Paused
												</span>
											</>
										)}
										{transfer.status === "active" &&
											isUpcoming(transfer.nextDate) && (
												<>
													<span className="mx-2">
														•
													</span>
													<span className="badge bg-info text-white">
														Upcoming
													</span>
												</>
											)}
									</div>
								</div>
							</div>
							<div className="d-flex align-items-center">
								<div className="text-end me-3">
									<p className="fw-medium mb-1">
										{formatCurrency(transfer.amount)}
									</p>
									<span
										className={`badge ${
											transfer.status === "active"
												? "bg-success text-white"
												: "bg-warning text-dark"
										}`}
									>
										{transfer.status.toUpperCase()}
									</span>
								</div>
								<div className="dropdown">
									<button
										className="btn btn-outline-secondary btn-sm"
										data-bs-toggle="dropdown"
										aria-expanded="false"
									>
										<MoreHorizontal size={16} />
									</button>
									<ul className="dropdown-menu dropdown-menu-end">
										<li>
											<button
												className="dropdown-item"
												onClick={() =>
													handleEditTransfer(transfer)
												}
											>
												<Edit
													size={14}
													className="me-2"
												/>
												Edit
											</button>
										</li>
										<li>
											<button
												className="dropdown-item"
												onClick={() =>
													handleToggleStatus(
														transfer.id,
														transfer.status
													)
												}
											>
												{transfer.status ===
												"active" ? (
													<>
														<Pause
															size={14}
															className="me-2"
														/>
														Pause
													</>
												) : (
													<>
														<Play
															size={14}
															className="me-2"
														/>
														Resume
													</>
												)}
											</button>
										</li>
										<li>
											<hr className="dropdown-divider" />
										</li>
										<li>
											<button
												className="dropdown-item text-danger"
												onClick={() =>
													handleDeleteTransfer(
														transfer.id
													)
												}
											>
												<Trash2
													size={14}
													className="me-2"
												/>
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

			{scheduledTransfers.length > 5 && (
				<div className="text-center mt-4">
					<Button variant="outline">
						Show All Scheduled Transfers
					</Button>
				</div>
			)}
		</div>
	);
};

export default ScheduledTransfersTab;
