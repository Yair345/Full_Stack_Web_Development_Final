import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import PersonalInfoTab from "./PersonalInfoTab";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";
import { authAPI } from "../../services/api";
import { setUser } from "../../store/slices/authSlice";

const Profile = () => {
	const [activeTab, setActiveTab] = useState("personal");
	const [editMode, setEditMode] = useState({});
	const [tempData, setTempData] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Get user data from Redux store
	const dispatch = useDispatch();
	const { user, isAuthenticated } = useSelector((state) => state.auth);

	// Transform user data to match component structure
	const profileData = user
		? {
				personal: {
					firstName: user.first_name,
					lastName: user.last_name,
					username: user.username,
					email: user.email,
					phone: user.phone || "",
					dateOfBirth: user.date_of_birth,
					nationalId: user.national_id,
				},
				address: {
					street: user.address
						? (user.address.split(",")[0] || "").trim()
						: "",
					city: user.address
						? (user.address.split(",")[1] || "").trim()
						: "",
					state: user.address
						? (user.address.split(",")[2] || "").trim()
						: "",
					zipCode: user.address
						? (user.address.split(",")[3] || "").trim()
						: "",
					country: user.address
						? (user.address.split(",")[4] || "").trim() ||
						  "United States"
						: "United States",
				},
				security: {
					// Security info is handled separately for safety
				},
		  }
		: null;

	// Fetch user profile if not already loaded
	useEffect(() => {
		const fetchProfile = async () => {
			if (!user && isAuthenticated) {
				try {
					setLoading(true);
					const response = await authAPI.getProfile();
					dispatch(setUser(response.data.user));
					setError(null);
				} catch (err) {
					console.error("Failed to fetch profile:", err);
					setError(err.message);
				} finally {
					setLoading(false);
				}
			}
		};

		fetchProfile();
	}, [user, isAuthenticated, dispatch]);

	const updateProfileOnServer = async (field, value) => {
		try {
			const updateData = {};

			// Map frontend fields to server fields
			switch (field) {
				case "firstName":
					// First name cannot be updated through profile
					throw new Error("First name cannot be updated");
				case "lastName":
					// Last name cannot be updated through profile
					throw new Error("Last name cannot be updated");
				case "phone":
					updateData.phone = value;
					break;
				case "username":
					updateData.username = value;
					break;
				default:
					// For address fields, we need to reconstruct the full address
					if (
						[
							"street",
							"city",
							"state",
							"zipCode",
							"country",
						].includes(field)
					) {
						const currentAddress = profileData.address;
						const updatedAddress = {
							...currentAddress,
							[field]: value,
						};
						// Filter out empty strings and join with commas
						const addressParts = [
							updatedAddress.street,
							updatedAddress.city,
							updatedAddress.state,
							updatedAddress.zipCode,
							updatedAddress.country,
						].filter((part) => part && part.trim() !== "");
						updateData.address = addressParts.join(", ");
					}
					break;
			}

			await authAPI.updateProfile(updateData);
		} catch (error) {
			console.error("Failed to update profile:", error);
			throw error;
		}
	};

	const handlePasswordChange = async (passwordData) => {
		try {
			await authAPI.changePassword({
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
			});
			alert("Password updated successfully!");
		} catch (error) {
			console.error("Password change failed:", error);
			alert("Failed to update password: " + error.message);
		}
	};

	const handleEdit = (section, field) => {
		const key = `${section}.${field}`;
		setEditMode((prev) => ({ ...prev, [key]: true }));
		setTempData((prev) => ({
			...prev,
			[key]: profileData[section][field],
		}));
	};

	const handleSave = async (section, field) => {
		const key = `${section}.${field}`;
		const value = tempData[key];

		try {
			// Update server first
			await updateProfileOnServer(field, value);

			// Update Redux store with the new user data
			const updatedUser = { ...user };

			// Map frontend fields back to server fields
			switch (field) {
				case "phone":
					updatedUser.phone = value;
					break;
				case "username":
					updatedUser.username = value;
					break;
				default:
					// For address fields, reconstruct the full address
					if (
						[
							"street",
							"city",
							"state",
							"zipCode",
							"country",
						].includes(field)
					) {
						const currentAddress = profileData.address;
						const updatedAddress = {
							...currentAddress,
							[field]: value,
						};
						const addressParts = [
							updatedAddress.street,
							updatedAddress.city,
							updatedAddress.state,
							updatedAddress.zipCode,
							updatedAddress.country,
						].filter((part) => part && part.trim() !== "");
						updatedUser.address = addressParts.join(", ");
					}
					break;
			}

			dispatch(setUser(updatedUser));

			setEditMode((prev) => ({ ...prev, [key]: false }));
			setTempData((prev) => ({ ...prev, [key]: undefined }));

			alert("Profile updated successfully!");
		} catch (error) {
			console.error("Failed to save profile:", error);
			alert("Failed to update profile: " + error.message);
		}
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
		// Don't render if profileData is not loaded yet
		if (!profileData) {
			return null;
		}

		switch (activeTab) {
			case "personal":
				return (
					<PersonalInfoTab
						personalData={profileData.personal}
						editMode={editMode}
						tempData={tempData}
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
						tempData={tempData}
						onEdit={handleEdit}
						onSave={handleSave}
						onCancel={handleCancel}
						onInputChange={handleInputChange}
					/>
				);
			case "security":
				return <SecurityTab onPasswordChange={handlePasswordChange} />;
			default:
				return null;
		}
	};

	// Loading state - show if we don't have user data and we're authenticated
	if (loading || (!user && isAuthenticated)) {
		return (
			<div className="container-fluid p-4">
				<div className="text-center">
					<div className="spinner-border" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-2">Loading profile...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container-fluid p-4">
				<div className="alert alert-danger" role="alert">
					<h4 className="alert-heading">Error loading profile</h4>
					<p>{error}</p>
					<button
						className="btn btn-outline-danger"
						onClick={() => window.location.reload()}
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	// No data state - show if user is not authenticated or no user data
	if (!isAuthenticated || !user) {
		return (
			<div className="container-fluid p-4">
				<div className="alert alert-warning" role="alert">
					<h4 className="alert-heading">No profile data</h4>
					<p>Please log in to view your profile information.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container-fluid p-4">
			{profileData && (
				<ProfileHeader
					profileData={profileData}
					onDownloadStatement={handleDownloadStatement}
				/>
			)}

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
