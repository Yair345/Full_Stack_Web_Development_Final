import { Activity, Users, Shield, Database } from "lucide-react";

const AdminTabs = ({ activeTab, onTabChange }) => {
	const tabs = [
		{
			id: "overview",
			label: "Overview",
			icon: Activity,
		},
		{
			id: "users",
			label: "User Management",
			icon: Users,
		},
		{
			id: "activity",
			label: "Activity Log",
			icon: Shield,
		},
		{
			id: "system",
			label: "System Health",
			icon: Database,
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

export default AdminTabs;
