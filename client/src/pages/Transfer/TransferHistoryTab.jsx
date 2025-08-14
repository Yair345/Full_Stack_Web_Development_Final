import { History } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const TransferHistoryTab = () => {
	return (
		<div className="col-12">
			<Card>
				<div className="text-center py-5">
					<History size={48} className="text-muted mb-3" />
					<h5 className="fw-medium mb-2">Transfer History</h5>
					<p className="text-muted mb-4">
						View your transfer history and receipts
					</p>
					<Button variant="outline">View All Transfers</Button>
				</div>
			</Card>
		</div>
	);
};

export default TransferHistoryTab;
