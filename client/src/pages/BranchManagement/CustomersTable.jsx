import { Eye, Edit3, Phone } from "lucide-react";
import {
	formatCurrency,
	getStatusBadge,
	getRiskScore,
	getAccountTypeColor,
} from "./branchUtils";

const CustomerActionButtons = ({ customer, onCustomerAction }) => {
	const handleAction = (action) => {
		onCustomerAction(action, customer.id);
	};

	return (
		<div className="btn-group" role="group" aria-label="Customer actions">
			{/* View Button - Always Available */}
			<button
				className="btn btn-outline-info btn-sm"
				onClick={() => handleAction("View")}
				title="View Customer Profile"
			>
				<Eye size={14} />
			</button>

			{/* Edit Button - Available for active customers */}
			{(customer.approval_status === "approved" ||
				customer.is_active) && (
				<button
					className="btn btn-outline-primary btn-sm"
					onClick={() => handleAction("Edit")}
					title="Edit Customer Details"
				>
					<Edit3 size={14} />
				</button>
			)}

			{/* Contact Button */}
			{customer.phone && (
				<button
					className="btn btn-outline-success btn-sm"
					onClick={() => handleAction("Contact")}
					title="Contact Customer"
				>
					<Phone size={14} />
				</button>
			)}
		</div>
	);
};

const CustomersTable = ({ customers, onCustomerAction }) => {
	// Debug: Log customers to see their structure


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
						// Handle different possible status formats
						const status =
							customer.status ||
							(customer.is_active ? "active" : "inactive");
						const statusInfo = getStatusBadge(status);

						// Handle account type - get from accounts if available
						const accountType =
							customer.accountType ||
							(customer.accounts && customer.accounts[0]
								? customer.accounts[0].account_type
								: "Standard");
						const accountTypeColor =
							getAccountTypeColor(accountType);

						// Handle customer name
						const customerName =
							customer.name ||
							(customer.first_name && customer.last_name
								? `${customer.first_name} ${customer.last_name}`
								: customer.username || "Unknown");

						// Handle account number and balance
						const accountNumber =
							customer.accountNumber ||
							(customer.accounts && customer.accounts[0]
								? customer.accounts[0].account_number
								: "N/A");
						const balance =
							customer.balance ||
							(customer.accounts && customer.accounts[0]
								? customer.accounts[0].balance
								: 0);

						return (
							<tr key={customer.id}>
								<td>
									<div>
										<div className="fw-medium">
											{customerName}
										</div>
										<small className="text-muted">
											{customer.email || "No email"}
										</small>
									</div>
								</td>
								<td>
									<div>
										<div className="fw-medium">
											{accountNumber}
										</div>
										<small
											className={`text-${accountTypeColor}`}
										>
											{accountType}
										</small>
									</div>
								</td>
								<td>
									<span className="fw-medium">
										{formatCurrency(balance)}
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
											getRiskScore(
												customer.riskScore || 1
											).class
										}
									>
										{
											getRiskScore(
												customer.riskScore || 1
											).text
										}
									</span>
								</td>
								<td>
									<small className="text-muted">
										{customer.lastVisit ||
											customer.last_login ||
											"Never"}
									</small>
								</td>
								<td>
									<CustomerActionButtons
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
