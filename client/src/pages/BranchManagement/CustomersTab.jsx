import { useState } from "react";
import { Search, Filter } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import CustomersTable from "./CustomersTable";
import { filterCustomers } from "./branchUtils";

const CustomersTab = ({
	customers,
	loading,
	error,
	onCustomerAction,
	onRefresh,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");

	const filteredCustomers = filterCustomers(
		customers,
		searchTerm,
		filterStatus
	);

	const handleClearFilters = () => {
		setSearchTerm("");
		setFilterStatus("all");
	};

	const hasActiveFilters = searchTerm || filterStatus !== "all";

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<div>
						<h5 className="fw-medium mb-0">Branch Customers</h5>
						{hasActiveFilters && (
							<small className="text-muted">
								Showing {filteredCustomers.length} of{" "}
								{customers?.length || 0} customers
							</small>
						)}
					</div>
					{hasActiveFilters && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleClearFilters}
						>
							Clear Filters
						</Button>
					)}
				</div>

				{/* Search and Filter */}
				<div className="row g-3 mb-4">
					<div className="col-md-6">
						<div className="input-group">
							<span className="input-group-text">
								<Search size={16} />
							</span>
							<Input
								placeholder="Search customers..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<div className="col-md-3">
						<select
							className="form-select"
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
						>
							<option value="all">All Customers</option>
							<option value="active">Active</option>
							<option value="vip">VIP</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>
					<div className="col-md-3">
						{onRefresh && (
							<Button
								variant="outline"
								className="w-100"
								onClick={onRefresh}
							>
								<Filter size={16} className="me-2" />
								Refresh Data
							</Button>
						)}
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="d-flex justify-content-center py-4">
						<div
							className="spinner-border text-primary"
							role="status"
						>
							<span className="visually-hidden">
								Loading customers...
							</span>
						</div>
					</div>
				)}

				{/* Error State */}
				{error && !loading && (
					<div className="alert alert-warning" role="alert">
						<div className="d-flex align-items-center">
							<div className="me-2">
								<svg
									width="20"
									height="20"
									fill="currentColor"
									className="bi bi-exclamation-triangle"
								>
									<path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
									<path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
								</svg>
							</div>
							<div className="flex-grow-1">
								<small>
									Unable to load customer data. Please try
									refreshing.
								</small>
							</div>
						</div>
					</div>
				)}

				{/* Customers Table */}
				{!loading && !error && (
					<CustomersTable
						customers={filteredCustomers}
						onCustomerAction={onCustomerAction}
					/>
				)}
			</Card>
		</div>
	);
};

export default CustomersTab;
