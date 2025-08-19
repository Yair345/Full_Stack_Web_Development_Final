import { Building } from "lucide-react";

const BranchHeader = ({ branchInfo }) => {
	// Safety check for branchInfo
	if (!branchInfo) {
		return (
			<div className="col-12">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<div>
						<h1 className="h2 fw-bold text-dark mb-1">
							Branch Management
						</h1>
						<p className="text-muted mb-0">
							<Building size={16} className="me-1" />
							Loading branch information...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h1 className="h2 fw-bold text-dark mb-1">
						Branch Management
					</h1>
					<p className="text-muted mb-0">
						<Building size={16} className="me-1" />
						{branchInfo?.branch_name || "Branch"} - Manager
						Dashboard
					</p>
				</div>
			</div>
		</div>
	);
};

export default BranchHeader;
