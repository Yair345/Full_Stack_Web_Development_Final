import { Plus, Clock } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatCurrency } from "./transferUtils";

const ScheduledTransfersTab = ({ scheduledTransfers, onScheduleTransfer }) => {
	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h5 className="fw-medium mb-0">Scheduled Transfers</h5>
				<Button variant="primary" onClick={onScheduleTransfer}>
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
									<Clock size={20} className="text-muted" />
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
										{formatCurrency(transfer.amount)}
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
												{transfer.status === "active"
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
	);
};

export default ScheduledTransfersTab;
