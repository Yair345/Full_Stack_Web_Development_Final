import { useState } from "react";
import { Search, Filter, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import CustomersTable from "./CustomersTable";
import { filterCustomers } from "./branchUtils";

const CustomersTab = ({ customers, onAddCustomer, onCustomerAction }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");

	const filteredCustomers = filterCustomers(
		customers,
		searchTerm,
		filterStatus
	);

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h5 className="fw-medium mb-0">Branch Customers</h5>
					<Button variant="primary" onClick={onAddCustomer}>
						<Users size={16} className="me-2" />
						Add Customer
					</Button>
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
						<Button variant="outline" className="w-100">
							<Filter size={16} className="me-2" />
							Advanced Filter
						</Button>
					</div>
				</div>

				<CustomersTable
					customers={filteredCustomers}
					onCustomerAction={onCustomerAction}
				/>
			</Card>
		</div>
	);
};

export default CustomersTab;
