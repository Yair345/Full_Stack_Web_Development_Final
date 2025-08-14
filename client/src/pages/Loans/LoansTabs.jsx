import { TrendingUp, FileText, Calculator, Clock } from "lucide-react";

const LoansTabs = ({ activeTab, onTabChange }) => {
	const tabs = [
		{ id: "overview", label: "Overview", icon: TrendingUp },
		{ id: "apply", label: "Apply for Loan", icon: FileText },
		{ id: "calculator", label: "Calculator", icon: Calculator },
		{ id: "applications", label: "Applications", icon: Clock },
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

export default LoansTabs;
