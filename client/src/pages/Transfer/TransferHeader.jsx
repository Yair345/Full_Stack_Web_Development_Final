import { ArrowRightLeft } from "lucide-react";

const TransferHeader = () => {
	return (
		<div className="col-12">
			<div>
				<h1 className="h2 fw-bold text-dark mb-1">
					<ArrowRightLeft size={24} className="me-2" />
					Transfer Money
				</h1>
				<p className="text-muted">
					Send money between accounts or to other recipients
				</p>
			</div>
		</div>
	);
};

export default TransferHeader;
