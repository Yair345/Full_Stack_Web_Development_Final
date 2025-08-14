import { User, Download } from "lucide-react";
import Button from "../../components/ui/Button";
import { getInitials } from "./profileUtils";

const ProfileHeader = ({ profileData, onDownloadStatement }) => {
	const { firstName, lastName, email } = profileData.personal;

	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div className="d-flex align-items-center">
					<div
						className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
						style={{ width: "60px", height: "60px" }}
					>
						<span className="h4 mb-0">
							{getInitials(firstName, lastName)}
						</span>
					</div>
					<div>
						<h1 className="h2 fw-bold text-dark mb-1">
							{firstName} {lastName}
						</h1>
						<p className="text-muted mb-0">
							<User size={16} className="me-1" />
							{email}
						</p>
					</div>
				</div>
				<div className="d-flex gap-2">
					<Button variant="outline" onClick={onDownloadStatement}>
						<Download size={16} className="me-2" />
						Download Statement
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader;
