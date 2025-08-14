import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import PersonalInfoTab from "./PersonalInfoTab";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";
import PreferencesTab from "./PreferencesTab";
import { mockProfileData } from "./profileUtils";

const Profile = () => {
	const [activeTab, setActiveTab] = useState("personal");
	const [profileData, setProfileData] = useState(mockProfileData);
	const [editMode, setEditMode] = useState({});
	const [tempData, setTempData] = useState({});

	const handlePersonalInfoChange = (field, value) => {
		setProfileData((prev) => ({
			...prev,
			personal: {
				...prev.personal,
				[field]: value,
			},
		}));
	};

	const handleAddressChange = (field, value) => {
		setProfileData((prev) => ({
			...prev,
			address: {
				...prev.address,
				[field]: value,
			},
		}));
	};

	const handleSecurityChange = (field, value) => {
		setProfileData((prev) => ({
			...prev,
			security: {
				...prev.security,
				[field]: value,
			},
		}));
	};

	const handlePasswordChange = (passwordData) => {
		// In a real app, this would make an API call to change the password
		console.log("Password change requested:", passwordData);
		// Show success message
		alert("Password updated successfully!");
	};

	const handlePreferencesChange = (field, value) => {
		setProfileData((prev) => ({
			...prev,
			preferences: {
				...prev.preferences,
				[field]: value,
			},
		}));
	};

	const handleEdit = (section, field) => {
		const key = `${section}.${field}`;
		setEditMode((prev) => ({ ...prev, [key]: true }));
		setTempData((prev) => ({
			...prev,
			[key]: profileData[section][field],
		}));
	};

	const handleSave = (section, field) => {
		const key = `${section}.${field}`;
		const value = tempData[key];

		if (section === "personal") {
			handlePersonalInfoChange(field, value);
		} else if (section === "address") {
			handleAddressChange(field, value);
		} else if (section === "security") {
			handleSecurityChange(field, value);
		} else if (section === "preferences") {
			handlePreferencesChange(field, value);
		}

		setEditMode((prev) => ({ ...prev, [key]: false }));
		setTempData((prev) => ({ ...prev, [key]: undefined }));
	};

	const handleCancel = (section, field) => {
		const key = `${section}.${field}`;
		setEditMode((prev) => ({ ...prev, [key]: false }));
		setTempData((prev) => ({ ...prev, [key]: undefined }));
	};

	const handleInputChange = (section, field, value) => {
		const key = `${section}.${field}`;
		setTempData((prev) => ({ ...prev, [key]: value }));
	};

	const handleDownloadStatement = () => {
		// In a real app, this would trigger a download of the user's statement
		console.log("Downloading statement...");
		alert("Statement download started!");
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "personal":
				return (
					<PersonalInfoTab
						personalData={profileData.personal}
						editMode={editMode}
						onEdit={handleEdit}
						onSave={handleSave}
						onCancel={handleCancel}
						onInputChange={handleInputChange}
					/>
				);
			case "address":
				return (
					<AddressTab
						addressData={profileData.address}
						editMode={editMode}
						onEdit={handleEdit}
						onSave={handleSave}
						onCancel={handleCancel}
						onInputChange={handleInputChange}
					/>
				);
			case "security":
				return (
					<SecurityTab
						securityData={profileData.security}
						onSecurityChange={handleSecurityChange}
						onPasswordChange={handlePasswordChange}
					/>
				);
			case "preferences":
				return (
					<PreferencesTab
						preferencesData={profileData.preferences}
						onPreferencesChange={handlePreferencesChange}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="container-fluid p-4">
			<ProfileHeader
				profileData={profileData}
				onDownloadStatement={handleDownloadStatement}
			/>

			<div className="row mt-4">
				<div className="col-12">
					<ProfileTabs
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>
				</div>
			</div>

			<div className="row mt-4">{renderTabContent()}</div>
		</div>
	);
};

export default Profile;
