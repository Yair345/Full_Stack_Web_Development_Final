import { useState } from "react";
import Button from "../../components/ui/Button";

const RejectionModal = ({ show, onHide, onConfirm, loanData }) => {
	const [reason, setReason] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!reason.trim()) {
			alert("Please provide a reason for rejection.");
			return;
		}

		setLoading(true);
		try {
			await onConfirm(reason);
			setReason("");
			onHide();
		} catch (error) {
			console.error("Rejection failed:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setReason("");
		onHide();
	};

	if (!show) return null;

	return (
		<div
			className="modal show d-block"
			tabIndex="-1"
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
		>
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Reject Loan Application</h5>
						<button
							type="button"
							className="btn-close"
							onClick={handleCancel}
							disabled={loading}
						></button>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="modal-body">
							{loanData && (
								<div className="mb-3">
									<h6>Loan Application Details:</h6>
									<p className="text-muted mb-1">
										<strong>Applicant:</strong>{" "}
										{loanData.customerName ||
											(loanData.borrower
												? `${loanData.borrower.first_name} ${loanData.borrower.last_name}`
												: "Unknown")}
									</p>
									<p className="text-muted mb-1">
										<strong>Amount:</strong> $
										{(
											loanData.requestedAmount ||
											loanData.amount ||
											0
										).toLocaleString()}
									</p>
									<p className="text-muted mb-3">
										<strong>Type:</strong>{" "}
										{loanData.loanType ||
											loanData.loan_type ||
											"N/A"}
									</p>
								</div>
							)}
							<div className="mb-3">
								<label
									htmlFor="rejectionReason"
									className="form-label"
								>
									Reason for Rejection{" "}
									<span className="text-danger">*</span>
								</label>
								<textarea
									id="rejectionReason"
									className="form-control"
									rows="4"
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="Please provide a detailed reason for rejecting this loan application..."
									disabled={loading}
									required
								/>
							</div>
						</div>
						<div className="modal-footer">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="danger"
								disabled={loading || !reason.trim()}
							>
								{loading
									? "Rejecting..."
									: "Reject Application"}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default RejectionModal;
