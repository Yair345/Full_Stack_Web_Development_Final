import { Plus, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const RecipientsTab = ({ recipients, onRecipientSelect, onAddRecipient }) => {
	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h5 className="fw-medium mb-0">Recent Recipients</h5>
				<Button variant="primary" onClick={onAddRecipient}>
					<Plus size={16} className="me-2" />
					Add Recipient
				</Button>
			</div>

			<div className="row g-3">
				{recipients.map((recipient) => (
					<div key={recipient.id} className="col-md-6 col-lg-4">
						<Card
							className="h-100 cursor-pointer hover-bg-light"
							onClick={() => onRecipientSelect(recipient)}
						>
							<div className="d-flex align-items-center mb-3">
								<div className="bg-light rounded-circle p-2 me-3">
									<Users size={20} className="text-muted" />
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
	);
};

export default RecipientsTab;
