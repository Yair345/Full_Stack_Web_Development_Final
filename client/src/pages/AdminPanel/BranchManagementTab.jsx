import { useState } from "react";
import {
	Building2,
	Plus,
	Edit,
	Trash2,
	Users,
	MapPin,
	Search,
} from "lucide-react";
import AddBranchModal from "./AddBranchModal";
import EditBranchModal from "./EditBranchModal";

const BranchManagementTab = ({
	branches = [],
	availableManagers = [],
	onAddBranch,
	onUpdateBranch,
	onDeleteBranch,
	onRefresh,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedBranch, setSelectedBranch] = useState(null);

	const filteredBranches = branches.filter((branch) => {
		const matchesSearch =
			branch.branch_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			branch.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			branch.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			branch.branch_code
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "active" && branch.is_active) ||
			(statusFilter === "inactive" && !branch.is_active);
		return matchesSearch && matchesStatus;
	});

	const handleEditBranch = (branch) => {
		setSelectedBranch(branch);
		setShowEditModal(true);
	};

	const handleDeleteBranch = async (branchId, branchName) => {
		if (
			window.confirm(
				`Are you sure you want to delete branch "${branchName}"? This action cannot be undone.`
			)
		) {
			try {
				await onDeleteBranch(branchId);
				onRefresh();
			} catch (error) {
				console.error("Error deleting branch:", error);
				alert("Error deleting branch. Please try again.");
			}
		}
	};

	const handleAddSuccess = () => {
		setShowAddModal(false);
		onRefresh();
	};

	const handleEditSuccess = () => {
		setShowEditModal(false);
		setSelectedBranch(null);
		onRefresh();
	};

	return (
		<div className="col-12">
			<div className="card shadow-sm">
				<div className="card-header d-flex justify-content-between align-items-center">
					<div className="d-flex align-items-center">
						<Building2 size={20} className="text-primary me-2" />
						<h5 className="mb-0">Branch Management</h5>
					</div>
					<button
						className="btn btn-primary btn-sm"
						onClick={() => setShowAddModal(true)}
					>
						<Plus size={16} className="me-1" />
						Add Branch
					</button>
				</div>

				<div className="card-body">
					{/* Search and Filter Controls */}
					<div className="row mb-4">
						<div className="col-md-6">
							<div className="input-group">
								<span className="input-group-text">
									<Search size={16} />
								</span>
								<input
									type="text"
									className="form-control"
									placeholder="Search branches..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
								/>
							</div>
						</div>
						<div className="col-md-3">
							<select
								className="form-select"
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(e.target.value)
								}
							>
								<option value="all">All Status</option>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
							</select>
						</div>
						<div className="col-md-3 text-end">
							<button
								className="btn btn-outline-primary btn-sm"
								onClick={onRefresh}
							>
								Refresh
							</button>
						</div>
					</div>

					{/* Branch Statistics */}
					<div className="row mb-4">
						<div className="col-md-3">
							<div className="card bg-primary text-white">
								<div className="card-body">
									<div className="d-flex justify-content-between">
										<div>
											<h6 className="card-title">
												Total Branches
											</h6>
											<h4 className="mb-0">
												{branches.length}
											</h4>
										</div>
										<Building2
											size={32}
											className="opacity-75"
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="card bg-success text-white">
								<div className="card-body">
									<div className="d-flex justify-content-between">
										<div>
											<h6 className="card-title">
												Active
											</h6>
											<h4 className="mb-0">
												{
													branches.filter(
														(b) => b.is_active
													).length
												}
											</h4>
										</div>
										<Building2
											size={32}
											className="opacity-75"
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="card bg-warning text-white">
								<div className="card-body">
									<div className="d-flex justify-content-between">
										<div>
											<h6 className="card-title">
												Inactive
											</h6>
											<h4 className="mb-0">
												{
													branches.filter(
														(b) => !b.is_active
													).length
												}
											</h4>
										</div>
										<Building2
											size={32}
											className="opacity-75"
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="card bg-info text-white">
								<div className="card-body">
									<div className="d-flex justify-content-between">
										<div>
											<h6 className="card-title">
												Total Customers
											</h6>
											<h4 className="mb-0">
												{branches.reduce(
													(sum, b) =>
														sum +
														(b.customerCount || 0),
													0
												)}
											</h4>
										</div>
										<Users
											size={32}
											className="opacity-75"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Branches Table */}
					<div className="table-responsive">
						<table className="table table-hover">
							<thead>
								<tr>
									<th>Branch Info</th>
									<th>Location</th>
									<th>Manager</th>
									<th>Customers</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{filteredBranches.length === 0 ? (
									<tr>
										<td
											colSpan="6"
											className="text-center text-muted py-4"
										>
											{searchTerm
												? "No branches found matching your search."
												: "No branches available."}
										</td>
									</tr>
								) : (
									filteredBranches.map((branch) => (
										<tr key={branch.id}>
											<td>
												<div>
													<strong>
														{branch.branch_name}
													</strong>
													{branch.branch_code && (
														<small className="d-block text-muted">
															Code:{" "}
															{branch.branch_code}
														</small>
													)}
													<small className="d-block text-muted">
														{branch.email}
													</small>
												</div>
											</td>
											<td>
												<div className="d-flex align-items-start">
													<MapPin
														size={16}
														className="text-muted me-1 mt-1"
													/>
													<div>
														<div>
															{branch.city},{" "}
															{branch.state}
														</div>
														<small className="text-muted">
															{branch.postal_code}
														</small>
													</div>
												</div>
											</td>
											<td>
												{branch.manager ? (
													<div>
														<div>
															{
																branch.manager
																	.first_name
															}{" "}
															{
																branch.manager
																	.last_name
															}
														</div>
														<small className="text-muted">
															{
																branch.manager
																	.email
															}
														</small>
													</div>
												) : (
													<span className="text-muted">
														No manager assigned
													</span>
												)}
											</td>
											<td>
												<span className="badge bg-secondary">
													{branch.customerCount || 0}
												</span>
											</td>
											<td>
												<span
													className={`badge ${
														branch.is_active
															? "bg-success"
															: "bg-danger"
													}`}
												>
													{branch.is_active
														? "Active"
														: "Inactive"}
												</span>
											</td>
											<td>
												<div
													className="btn-group"
													role="group"
													aria-label="Branch actions"
												>
													<button
														className="btn btn-outline-primary btn-sm"
														onClick={() =>
															handleEditBranch(
																branch
															)
														}
														title="Edit Branch"
													>
														<Edit size={14} />
													</button>
													<button
														className="btn btn-outline-danger btn-sm"
														onClick={() =>
															handleDeleteBranch(
																branch.id,
																branch.branch_name
															)
														}
														title="Delete Branch"
														disabled={
															branch.customerCount >
															0
														}
													>
														<Trash2 size={14} />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Add Branch Modal */}
			{showAddModal && (
				<AddBranchModal
					availableManagers={availableManagers}
					onAdd={onAddBranch}
					onClose={() => setShowAddModal(false)}
					onSuccess={handleAddSuccess}
				/>
			)}

			{/* Edit Branch Modal */}
			{showEditModal && selectedBranch && (
				<EditBranchModal
					branch={selectedBranch}
					availableManagers={availableManagers}
					onUpdate={onUpdateBranch}
					onClose={() => {
						setShowEditModal(false);
						setSelectedBranch(null);
					}}
					onSuccess={handleEditSuccess}
				/>
			)}
		</div>
	);
};

export default BranchManagementTab;
