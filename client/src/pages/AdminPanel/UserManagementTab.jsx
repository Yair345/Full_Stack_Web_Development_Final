import { useState } from "react";
import { Search, Filter, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import UsersTable from "./UsersTable";
import { filterUsers } from "./adminUtils";

const UserManagementTab = ({ users, onAddUser, onUserAction }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");

	const filteredUsers = filterUsers(users, searchTerm, filterStatus);

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h5 className="fw-medium mb-0">User Management</h5>
					<Button variant="primary" onClick={onAddUser}>
						<Users size={16} className="me-2" />
						Add User
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
								placeholder="Search users..."
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
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="suspended">Suspended</option>
							<option value="locked">Locked</option>
							<option value="pending">Pending</option>
						</select>
					</div>
					<div className="col-md-3">
						<Button variant="outline" className="w-100">
							<Filter size={16} className="me-2" />
							More Filters
						</Button>
					</div>
				</div>

				<UsersTable users={filteredUsers} onUserAction={onUserAction} />
			</Card>
		</div>
	);
};

export default UserManagementTab;
