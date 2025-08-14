import { DollarSign } from "lucide-react";

const LoansHeader = () => {
	return (
		<div className="col-12">
			<div>
				<h1 className="h2 fw-bold text-dark mb-1">
					<DollarSign size={24} className="me-2" />
					Loans
				</h1>
				<p className="text-muted">
					Manage your loans and apply for new ones
				</p>
			</div>
		</div>
	);
};

export default LoansHeader;
