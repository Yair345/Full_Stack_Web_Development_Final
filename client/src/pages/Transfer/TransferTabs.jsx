import { Send, Users, Clock, History } from "lucide-react";

const TransferTabs = ({ activeTab, onTabChange }) => {
	const tabs = [
		{ id: "quick", label: "Quick Transfer", icon: Send },
		{ id: "recipients", label: "Recipients", icon: Users },
		{ id: "scheduled", label: "Scheduled", icon: Clock },
		{ id: "history", label: "History", icon: History },
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

export default TransferTabs;
