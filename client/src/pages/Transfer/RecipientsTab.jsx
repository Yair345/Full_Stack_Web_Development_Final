import { Plus, Users, Building, CreditCard } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const RecipientsTab = ({ recipients, onRecipientSelect, onAddRecipient }) => {
	const getRecipientIcon = (type) => {
		switch (type) {
			case "internal":
				return <CreditCard size={20} className="text-primary" />;
			case "external":
				return <Users size={20} className="text-info" />;
			case "bill":
				return <Building size={20} className="text-warning" />;
			default:
				return <Users size={20} className="text-muted" />;
		}
	};

	const getTypeLabel = (type) => {
		switch (type) {
			case "internal":
				return "Internal";
			case "external":
				return "External";
			case "bill":
				return "Bill Payment";
			default:
				return "Unknown";
		}
	};

	if (!recipients || recipients.length === 0) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<Users size={48} className="text-muted mb-3" />
						<h5 className="fw-medium mb-2">No Recent Recipients</h5>
						<p className="text-muted mb-4">
							Add recipients to make future transfers faster and
							easier
						</p>
						<Button variant="primary" onClick={onAddRecipient}>
							<Plus size={16} className="me-2" />
							Add Your First Recipient
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
					<h5 className="fw-medium mb-1">Recent Recipients</h5>
					<p className="text-muted small mb-0">
						Click on a recipient to quickly start a transfer
					</p>
				</div>
				<Button variant="primary" onClick={onAddRecipient}>
					<Plus size={16} className="me-2" />
					Add Recipient
				</Button>
			</div>

			<div className="row g-3">
				{recipients.map((recipient) => (
					<div key={recipient.id} className="col-md-6 col-lg-4">
						<Card
							className="h-100 cursor-pointer hover-bg-light border-0 shadow-sm"
							onClick={() => onRecipientSelect(recipient)}
							style={{ cursor: "pointer" }}
						>
							<div className="d-flex align-items-center mb-3">
								<div className="bg-light rounded-circle p-2 me-3">
									{getRecipientIcon(recipient.type)}
								</div>
								<div className="flex-grow-1">
									<h6 className="fw-medium mb-1">
										{recipient.name}
									</h6>
									<small className="text-muted">
										{recipient.bank}
									</small>
								</div>
								<span
									className={`badge badge-sm ${
										recipient.type === "internal"
											? "bg-primary"
											: recipient.type === "external"
											? "bg-info"
											: "bg-warning"
									}`}
								>
									{getTypeLabel(recipient.type)}
								</span>
							</div>
							<div className="d-flex justify-content-between align-items-center">
								<small className="text-muted">
									{recipient.accountNumber}
								</small>
								<small className="text-muted">
									Last:{" "}
									{new Date(
										recipient.lastTransfer
									).toLocaleDateString()}
								</small>
							</div>
						</Card>
					</div>
				))}
			</div>

			{recipients.length > 6 && (
				<div className="text-center mt-4">
					<Button variant="outline">Show All Recipients</Button>
				</div>
			)}
		</div>
	);
};

export default RecipientsTab;
