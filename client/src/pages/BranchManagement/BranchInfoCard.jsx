import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Card from "../../components/ui/Card";

const BranchInfoCard = ({ branchInfo }) => {
	return (
		<div className="col-lg-4">
			<Card>
				<h6 className="fw-medium mb-3">Branch Information</h6>
				{branchInfo ? (
					<div className="small">
						<div className="d-flex align-items-center mb-2">
							<MapPin size={14} className="me-2 text-muted" />
							<span>
								{branchInfo?.address || "Address not available"}
							</span>
						</div>
						<div className="d-flex align-items-center mb-2">
							<Phone size={14} className="me-2 text-muted" />
							<span>
								{branchInfo?.phone || "Phone not available"}
							</span>
						</div>
						<div className="d-flex align-items-center mb-2">
							<Mail size={14} className="me-2 text-muted" />
							<span>
								{branchInfo?.email || "Email not available"}
							</span>
						</div>
						<div className="d-flex align-items-center">
							<Clock size={14} className="me-2 text-muted" />
							<span>
								{branchInfo?.opening_hours?.monday ||
									"Hours not available"}
							</span>
						</div>
					</div>
				) : (
					<div className="d-flex justify-content-center py-3">
						<div
							className="spinner-border spinner-border-sm text-primary"
							role="status"
						>
							<span className="visually-hidden">
								Loading branch information...
							</span>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
};

export default BranchInfoCard;
