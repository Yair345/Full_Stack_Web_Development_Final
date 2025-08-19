import {
	TrendingUp,
	Users,
	FileText,
	UserCheck,
	DollarSign,
} from "lucide-react";

const BranchTabs = ({ activeTab, onTabChange }) => {
	const tabs = [
		{
			id: "overview",
			label: "Overview",
			icon: TrendingUp,
		},
		{
			id: "customers",
			label: "Customers",
			icon: Users,
		},
		{
			id: "pending-users",
			label: "Pending Users",
			icon: UserCheck,
		},
		{
			id: "loans",
			label: "Loan Applications",
			icon: FileText,
		},
		{
			id: "cash-deposit",
			label: "Cash Deposit",
			icon: DollarSign,
		},
	];

	return (
		<div className="col-12">
			<ul className="nav nav-pills mb-4">
				{tabs.map((tab) => {
					const IconComponent = tab.icon;
					return (
						<li key={tab.id} className="nav-item">
							<button
								className={`nav-link ${
									activeTab === tab.id ? "active" : ""
								}`}
								onClick={() => onTabChange(tab.id)}
							>
								<IconComponent size={16} className="me-2" />
								{tab.label}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default BranchTabs;
