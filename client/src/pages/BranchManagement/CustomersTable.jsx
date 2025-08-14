import { MoreVertical, Eye, Edit3, Phone, FileText } from "lucide-react";
import {
	formatCurrency,
	getStatusBadge,
	getRiskScore,
	getAccountTypeColor,
} from "./branchUtils";

const CustomerActionDropdown = ({ customer, onCustomerAction }) => {
	return (
		<div className="dropdown">
			<button
				className="btn btn-outline-secondary btn-sm"
				data-bs-toggle="dropdown"
				aria-expanded="false"
			>
				<MoreVertical size={14} />
			</button>
			<ul className="dropdown-menu">
				<li>
					<button
						className="dropdown-item"
						onClick={() => onCustomerAction("View", customer.id)}
					>
						<Eye size={14} className="me-2" />
						View Profile
					</button>
				</li>
				<li>
					<button
						className="dropdown-item"
						onClick={() => onCustomerAction("Edit", customer.id)}
					>
						<Edit3 size={14} className="me-2" />
						Edit Details
					</button>
				</li>
				<li>
					<button
						className="dropdown-item"
						onClick={() => onCustomerAction("Contact", customer.id)}
					>
						<Phone size={14} className="me-2" />
						Contact Customer
					</button>
				</li>
				<li>
					<hr className="dropdown-divider" />
				</li>
				<li>
					<button
						className="dropdown-item"
						onClick={() =>
							onCustomerAction("Account History", customer.id)
						}
					>
						<FileText size={14} className="me-2" />
						Account History
					</button>
				</li>
			</ul>
		</div>
	);
};

const CustomersTable = ({ customers, onCustomerAction }) => {
	return (
		<div className="table-responsive">
			<table className="table table-hover">
				<thead>
					<tr>
						<th>Customer</th>
						<th>Account</th>
						<th>Balance</th>
						<th>Status</th>
						<th>Risk Score</th>
						<th>Last Visit</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{customers.map((customer) => {
						const statusInfo = getStatusBadge(customer.status);
						const accountTypeColor = getAccountTypeColor(
							customer.accountType
						);

						return (
							<tr key={customer.id}>
								<td>
									<div>
										<div className="fw-medium">
											{customer.name}
										</div>
										<small className="text-muted">
											{customer.email}
										</small>
									</div>
								</td>
								<td>
									<div>
										<div className="fw-medium">
											{customer.accountNumber}
										</div>
										<small
											className={`text-${accountTypeColor}`}
										>
											{customer.accountType}
										</small>
									</div>
								</td>
								<td>
									<span className="fw-medium">
										{formatCurrency(customer.balance)}
									</span>
								</td>
								<td>
									<span
										className={`badge ${statusInfo.class}`}
									>
										{statusInfo.text}
									</span>
								</td>
								<td>
									<span
										className={
											getRiskScore(customer.riskScore)
												.class
										}
									>
										{getRiskScore(customer.riskScore).text}
									</span>
								</td>
								<td>
									<small className="text-muted">
										{customer.lastVisit}
									</small>
								</td>
								<td>
									<CustomerActionDropdown
										customer={customer}
										onCustomerAction={onCustomerAction}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{customers.length === 0 && (
				<div className="text-center py-4">
					<p className="text-muted">
						No customers found matching your search criteria.
					</p>
				</div>
			)}
		</div>
	);
};

export default CustomersTable;
