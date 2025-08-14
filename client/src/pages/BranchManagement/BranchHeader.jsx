import { Building, FileText, Calendar } from "lucide-react";
import Button from "../../components/ui/Button";

const BranchHeader = ({ branchInfo, onBranchReport, onScheduleMeeting }) => {
	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h1 className="h2 fw-bold text-dark mb-1">
						Branch Management
					</h1>
					<p className="text-muted mb-0">
						<Building size={16} className="me-1" />
						{branchInfo.name} - Manager Dashboard
					</p>
				</div>
				<div className="d-flex gap-2">
					<Button variant="outline" onClick={onBranchReport}>
						<FileText size={16} className="me-2" />
						Branch Report
					</Button>
					<Button variant="primary" onClick={onScheduleMeeting}>
						<Calendar size={16} className="me-2" />
						Schedule Meeting
					</Button>
				</div>
			</div>
		</div>
	);
};

export default BranchHeader;
