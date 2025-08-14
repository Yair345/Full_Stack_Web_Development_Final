import { User, MapPin, Shield, Bell } from "lucide-react";

const ProfileTabs = ({ activeTab, onTabChange }) => {
	const tabs = [
		{ id: "personal", label: "Personal Info", icon: User },
		{ id: "address", label: "Address", icon: MapPin },
		{ id: "security", label: "Security", icon: Shield },
		{ id: "preferences", label: "Preferences", icon: Bell },
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

export default ProfileTabs;
