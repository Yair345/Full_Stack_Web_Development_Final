import { Building2, Users, MapPin } from "lucide-react";

const BranchesOverviewCard = ({ systemStats }) => {
	// Safely handle undefined systemStats and ensure numeric calculations
	const stats = systemStats || {};
	const totalBranches = Number(stats.totalBranches) || 0;
	const activeBranches = Number(stats.activeBranches) || 0;
	const activeUsers = Number(stats.activeUsers) || 0;

	const branchSummary = {
		totalBranches,
		activeBranches,
		totalCustomers: activeUsers,
		avgCustomersPerBranch:
			activeBranches > 0 ? Math.round(activeUsers / activeBranches) : 0,
		utilizationPercent:
			totalBranches > 0
				? Math.round((activeBranches / totalBranches) * 100)
				: 0,
	};

	return (
		<div className="col-12">
			<div className="card shadow-sm">
				<div className="card-header d-flex justify-content-between align-items-center">
					<div className="d-flex align-items-center">
						<Building2 size={20} className="text-primary me-2" />
						<h5 className="mb-0">Branch Overview</h5>
					</div>
				</div>
				<div className="card-body">
					<div className="row">
						<div className="col-md-3">
							<div className="border rounded p-3 text-center">
								<Building2
									size={32}
									className="text-primary mb-2"
								/>
								<h4 className="text-primary mb-1">
									{branchSummary.totalBranches}
								</h4>
								<p className="mb-0 text-muted">
									Total Branches
								</p>
							</div>
						</div>
						<div className="col-md-3">
							<div className="border rounded p-3 text-center">
								<Building2
									size={32}
									className="text-success mb-2"
								/>
								<h4 className="text-success mb-1">
									{branchSummary.activeBranches}
								</h4>
								<p className="mb-0 text-muted">
									Active Branches
								</p>
							</div>
						</div>
						<div className="col-md-3">
							<div className="border rounded p-3 text-center">
								<Users size={32} className="text-info mb-2" />
								<h4 className="text-info mb-1">
									{branchSummary.totalCustomers.toLocaleString()}
								</h4>
								<p className="mb-0 text-muted">
									Total Customers
								</p>
							</div>
						</div>
						<div className="col-md-3">
							<div className="border rounded p-3 text-center">
								<MapPin
									size={32}
									className="text-warning mb-2"
								/>
								<h4 className="text-warning mb-1">
									{branchSummary.avgCustomersPerBranch}
								</h4>
								<p className="mb-0 text-muted">
									Avg. Customers/Branch
								</p>
							</div>
						</div>
					</div>

					<div className="row mt-4">
						<div className="col-md-6">
							<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
								<div>
									<h6 className="mb-1">Branch Utilization</h6>
									<small className="text-muted">
										Active vs Total
									</small>
								</div>
								<div className="text-end">
									<h5 className="mb-0 text-success">
										{branchSummary.utilizationPercent}%
									</h5>
								</div>
							</div>
						</div>
						<div className="col-md-6">
							<div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
								<div>
									<h6 className="mb-1">Network Health</h6>
									<small className="text-muted">
										All branches operational
									</small>
								</div>
								<div className="text-end">
									<span className="badge bg-success">
										Excellent
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BranchesOverviewCard;
