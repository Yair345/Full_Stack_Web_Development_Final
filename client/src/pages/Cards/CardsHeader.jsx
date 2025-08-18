import { CreditCard, Plus } from "lucide-react";
import Button from "../../components/ui/Button";

const CardsHeader = ({ onRequestCard }) => {
	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h1 className="h2 fw-bold text-dark mb-1">My Cards</h1>
					<p className="text-muted mb-0">
						<CreditCard size={16} className="me-1" />
						Manage your credit and debit cards
					</p>
				</div>
				<div className="d-flex gap-2">
					<Button variant="primary" onClick={onRequestCard}>
						<Plus size={16} className="me-2" />
						Request New Card
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CardsHeader;
