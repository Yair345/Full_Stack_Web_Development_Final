import { Settings, FileText } from "lucide-react";
import Button from "../../components/ui/Button";

const AdminHeader = ({ onGenerateReport, onSystemSettings }) => {
	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h1 className="h2 fw-bold text-dark mb-1">Admin Panel</h1>
					<p className="text-muted mb-0">
						System administration and user management
					</p>
				</div>
				<div className="d-flex gap-2">
					<Button variant="outline" onClick={onSystemSettings}>
						<Settings size={16} className="me-2" />
						System Settings
					</Button>
					<Button variant="primary" onClick={onGenerateReport}>
						<FileText size={16} className="me-2" />
						Generate Report
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AdminHeader;
