import {
	Users,
	FileText,
	Calendar,
	Building,
	MapPin,
	Phone,
	Mail,
	Clock,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const BranchSidebarCards = ({
	branchInfo,
	onAddCustomer,
	onReviewApplications,
	onScheduleAppointments,
	onBranchSettings,
}) => {
	// Safety check for branchInfo
	if (!branchInfo) {
		return (
			<div className="col-lg-4">
				<Card>
					<h6 className="fw-medium mb-3">Quick Actions</h6>
					<div className="d-grid gap-2 mb-3">
						<Button
							variant="outline"
							size="sm"
							onClick={onAddCustomer}
						>
							<Users size={14} className="me-2" />
							Add New Customer
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onReviewApplications}
						>
							<FileText size={14} className="me-2" />
							Review Applications
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onScheduleAppointments}
						>
							<Calendar size={14} className="me-2" />
							Schedule Appointments
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onBranchSettings}
						>
							<Building size={14} className="me-2" />
							Branch Settings
						</Button>
					</div>
				</Card>

				<Card>
					<h6 className="fw-medium mb-3">Branch Information</h6>
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
				</Card>
			</div>
		);
	}

	return (
		<div className="col-lg-4">
			<Card>
				<h6 className="fw-medium mb-3">Quick Actions</h6>
				<div className="d-grid gap-2 mb-3">
					<Button variant="outline" size="sm" onClick={onAddCustomer}>
						<Users size={14} className="me-2" />
						Add New Customer
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onReviewApplications}
					>
						<FileText size={14} className="me-2" />
						Review Applications
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onScheduleAppointments}
					>
						<Calendar size={14} className="me-2" />
						Schedule Appointments
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onBranchSettings}
					>
						<Building size={14} className="me-2" />
						Branch Settings
					</Button>
				</div>
			</Card>

			<Card>
				<h6 className="fw-medium mb-3">Branch Information</h6>
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
			</Card>
		</div>
	);
};

export default BranchSidebarCards;
