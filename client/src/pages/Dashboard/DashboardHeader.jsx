import { useSelector } from "react-redux";
import { RefreshCw } from "lucide-react";

const DashboardHeader = ({ onRefresh }) => {
	const { user } = useSelector((state) => state.auth);

	return (
		<div className="col-12">
			<div className="bg-gradient-primary rounded p-4 text-white">
				<div className="d-flex justify-content-between align-items-start">
					<div>
						<h1 className="h3 fw-bold mb-2">
							Welcome back,{" "}
							{user?.firstName || user?.first_name || "User"}!
						</h1>
						<p className="mb-0 opacity-75">
							Here's an overview of your accounts and recent
							activity.
						</p>
					</div>
					{onRefresh && (
						<button
							className="btn btn-outline-light btn-sm"
							onClick={onRefresh}
							title="Refresh dashboard data"
						>
							<RefreshCw size={16} className="me-1" />
							Refresh
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default DashboardHeader;
