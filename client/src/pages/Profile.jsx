import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Shield,
	Bell,
	CreditCard,
	Download,
	Edit3,
	Save,
	X,
	Eye,
	EyeOff,
	Smartphone,
	Globe,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Profile = () => {
	const { user } = useSelector((state) => state.auth);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("personal");
	const [editMode, setEditMode] = useState({});
	const [showPassword, setShowPassword] = useState({});
	const [profileData, setProfileData] = useState({
		personal: {
			firstName: "John",
			lastName: "Doe",
			email: "john.doe@email.com",
			phone: "+1 (555) 123-4567",
			dateOfBirth: "1990-05-15",
			ssn: "***-**-1234",
		},
		address: {
			street: "123 Main Street",
			city: "New York",
			state: "NY",
			zipCode: "10001",
			country: "United States",
		},
		security: {
			loginPassword: "••••••••",
			transactionPin: "••••",
			twoFactorEnabled: true,
			loginNotifications: true,
			biometricEnabled: false,
		},
		preferences: {
			language: "English",
			currency: "USD",
			timezone: "Eastern Time (UTC-5)",
			statements: "email",
			marketing: false,
			smsAlerts: true,
			emailAlerts: true,
			pushNotifications: true,
		},
	});

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleEdit = (section, field) => {
		setEditMode((prev) => ({
			...prev,
			[`${section}.${field}`]: true,
		}));
	};

	const handleSave = (section, field) => {
		setEditMode((prev) => ({
			...prev,
			[`${section}.${field}`]: false,
		}));
		// TODO: Save to backend
		console.log("Saving:", section, field, profileData[section][field]);
	};

	const handleCancel = (section, field, originalValue) => {
		setProfileData((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: originalValue,
			},
		}));
		setEditMode((prev) => ({
			...prev,
			[`${section}.${field}`]: false,
		}));
	};

	const handleInputChange = (section, field, value) => {
		setProfileData((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value,
			},
		}));
	};

	const handlePasswordChange = (e) => {
		e.preventDefault();
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			alert("New passwords don't match!");
			return;
		}
		console.log("Changing password...");
		alert("Password updated successfully!");
		setPasswordForm({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	};

	const togglePasswordVisibility = (field) => {
		setShowPassword((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const handleDownloadData = () => {
		console.log("Downloading user data...");
		alert("Your data download will be ready shortly!");
	};

	const renderEditableField = (
		section,
		field,
		label,
		type = "text",
		originalValue
	) => {
		const isEditing = editMode[`${section}.${field}`];
		const value = profileData[section][field];

		if (isEditing) {
			return (
				<div className="col-md-6 mb-3">
					<label className="form-label">{label}</label>
					<div className="input-group">
						<Input
							type={type}
							value={value}
							onChange={(e) =>
								handleInputChange(
									section,
									field,
									e.target.value
								)
							}
							className="form-control"
						/>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleSave(section, field)}
						>
							<Save size={14} />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								handleCancel(section, field, originalValue)
							}
						>
							<X size={14} />
						</Button>
					</div>
				</div>
			);
		}

		return (
			<div className="col-md-6 mb-3">
				<label className="form-label">{label}</label>
				<div className="input-group">
					<Input
						type={type}
						value={value}
						readOnly
						className="form-control bg-light"
					/>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleEdit(section, field)}
					>
						<Edit3 size={14} />
					</Button>
				</div>
			</div>
		);
	};

	return (
		<div className="row g-4">
			{/* Header */}
			<div className="col-12">
				<div className="d-flex align-items-center justify-content-between mb-4">
					<div>
						<h1 className="h2 fw-bold text-dark mb-1">
							Profile Settings
						</h1>
						<p className="text-muted mb-0">
							Manage your personal information and account
							preferences
						</p>
					</div>
					<div className="d-flex gap-2">
						<Button variant="outline" onClick={handleDownloadData}>
							<Download size={16} className="me-2" />
							Download Data
						</Button>
					</div>
				</div>
			</div>

			{/* Profile Summary Card */}
			<div className="col-12">
				<Card>
					<div className="d-flex align-items-center">
						<div
							className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-4"
							style={{ width: "80px", height: "80px" }}
						>
							<User size={32} className="text-white" />
						</div>
						<div className="flex-grow-1">
							<h4 className="fw-bold mb-1">
								{profileData.personal.firstName}{" "}
								{profileData.personal.lastName}
							</h4>
							<p className="text-muted mb-2">
								{profileData.personal.email}
							</p>
							<div className="d-flex gap-4 small text-muted">
								<span>
									<Phone size={14} className="me-1" />
									{profileData.personal.phone}
								</span>
								<span>
									<MapPin size={14} className="me-1" />
									{profileData.address.city},{" "}
									{profileData.address.state}
								</span>
							</div>
						</div>
						<div className="text-end">
							<span className="badge bg-success">
								Verified Account
							</span>
						</div>
					</div>
				</Card>
			</div>

			{/* Navigation Tabs */}
			<div className="col-12">
				<ul className="nav nav-pills mb-4">
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "personal" ? "active" : ""
							}`}
							onClick={() => setActiveTab("personal")}
						>
							<User size={16} className="me-2" />
							Personal Info
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "security" ? "active" : ""
							}`}
							onClick={() => setActiveTab("security")}
						>
							<Shield size={16} className="me-2" />
							Security
						</button>
					</li>
					<li className="nav-item">
						<button
							className={`nav-link ${
								activeTab === "preferences" ? "active" : ""
							}`}
							onClick={() => setActiveTab("preferences")}
						>
							<Bell size={16} className="me-2" />
							Preferences
						</button>
					</li>
				</ul>
			</div>

			{/* Personal Information Tab */}
			{activeTab === "personal" && (
				<>
					<div className="col-lg-8">
						<Card>
							<h5 className="fw-medium mb-4">
								Personal Information
							</h5>
							<div className="row">
								{renderEditableField(
									"personal",
									"firstName",
									"First Name",
									"text",
									"John"
								)}
								{renderEditableField(
									"personal",
									"lastName",
									"Last Name",
									"text",
									"Doe"
								)}
								{renderEditableField(
									"personal",
									"email",
									"Email Address",
									"email",
									"john.doe@email.com"
								)}
								{renderEditableField(
									"personal",
									"phone",
									"Phone Number",
									"tel",
									"+1 (555) 123-4567"
								)}
								{renderEditableField(
									"personal",
									"dateOfBirth",
									"Date of Birth",
									"date",
									"1990-05-15"
								)}
								<div className="col-md-6 mb-3">
									<label className="form-label">
										Social Security Number
									</label>
									<Input
										type="text"
										value={profileData.personal.ssn}
										readOnly
										className="form-control bg-light"
									/>
									<small className="text-muted">
										Contact support to update this field
									</small>
								</div>
							</div>
						</Card>

						<Card>
							<h5 className="fw-medium mb-4">
								Address Information
							</h5>
							<div className="row">
								{renderEditableField(
									"address",
									"street",
									"Street Address",
									"text",
									"123 Main Street"
								)}
								{renderEditableField(
									"address",
									"city",
									"City",
									"text",
									"New York"
								)}
								{renderEditableField(
									"address",
									"state",
									"State",
									"text",
									"NY"
								)}
								{renderEditableField(
									"address",
									"zipCode",
									"ZIP Code",
									"text",
									"10001"
								)}
								{renderEditableField(
									"address",
									"country",
									"Country",
									"text",
									"United States"
								)}
							</div>
						</Card>
					</div>

					<div className="col-lg-4">
						<Card>
							<h6 className="fw-medium mb-3">Account Status</h6>
							<div className="list-group list-group-flush">
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<span>Email Verification</span>
									<span className="badge bg-success">
										Verified
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<span>Phone Verification</span>
									<span className="badge bg-success">
										Verified
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<span>Identity Verification</span>
									<span className="badge bg-success">
										Verified
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
									<span>Account Status</span>
									<span className="badge bg-success">
										Active
									</span>
								</div>
							</div>
						</Card>

						<Card>
							<h6 className="fw-medium mb-3">Quick Actions</h6>
							<div className="d-grid gap-2">
								<Button variant="outline" size="sm">
									<CreditCard size={14} className="me-2" />
									View Statements
								</Button>
								<Button variant="outline" size="sm">
									<Download size={14} className="me-2" />
									Tax Documents
								</Button>
								<Button variant="outline" size="sm">
									<Mail size={14} className="me-2" />
									Contact Support
								</Button>
							</div>
						</Card>
					</div>
				</>
			)}

			{/* Security Tab */}
			{activeTab === "security" && (
				<>
					<div className="col-lg-8">
						<Card>
							<h5 className="fw-medium mb-4">Password & PIN</h5>
							<form onSubmit={handlePasswordChange}>
								<div className="row g-3">
									<div className="col-12">
										<label className="form-label">
											Current Password
										</label>
										<div className="input-group">
											<Input
												type={
													showPassword.current
														? "text"
														: "password"
												}
												value={
													passwordForm.currentPassword
												}
												onChange={(e) =>
													setPasswordForm((prev) => ({
														...prev,
														currentPassword:
															e.target.value,
													}))
												}
												placeholder="Enter current password"
											/>
											<Button
												type="button"
												variant="outline"
												onClick={() =>
													togglePasswordVisibility(
														"current"
													)
												}
											>
												{showPassword.current ? (
													<EyeOff size={14} />
												) : (
													<Eye size={14} />
												)}
											</Button>
										</div>
									</div>
									<div className="col-md-6">
										<label className="form-label">
											New Password
										</label>
										<div className="input-group">
											<Input
												type={
													showPassword.new
														? "text"
														: "password"
												}
												value={passwordForm.newPassword}
												onChange={(e) =>
													setPasswordForm((prev) => ({
														...prev,
														newPassword:
															e.target.value,
													}))
												}
												placeholder="Enter new password"
											/>
											<Button
												type="button"
												variant="outline"
												onClick={() =>
													togglePasswordVisibility(
														"new"
													)
												}
											>
												{showPassword.new ? (
													<EyeOff size={14} />
												) : (
													<Eye size={14} />
												)}
											</Button>
										</div>
									</div>
									<div className="col-md-6">
										<label className="form-label">
											Confirm New Password
										</label>
										<Input
											type="password"
											value={passwordForm.confirmPassword}
											onChange={(e) =>
												setPasswordForm((prev) => ({
													...prev,
													confirmPassword:
														e.target.value,
												}))
											}
											placeholder="Confirm new password"
										/>
									</div>
									<div className="col-12">
										<Button type="submit" variant="primary">
											Update Password
										</Button>
									</div>
								</div>
							</form>
						</Card>

						<Card>
							<h5 className="fw-medium mb-4">
								Two-Factor Authentication
							</h5>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h6 className="fw-medium mb-1">
										Authenticator App
									</h6>
									<small className="text-muted">
										Use an authenticator app for secure
										login
									</small>
								</div>
								<div className="form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										checked={
											profileData.security
												.twoFactorEnabled
										}
										onChange={(e) =>
											handleInputChange(
												"security",
												"twoFactorEnabled",
												e.target.checked
											)
										}
									/>
								</div>
							</div>

							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h6 className="fw-medium mb-1">
										SMS Authentication
									</h6>
									<small className="text-muted">
										Receive codes via SMS
									</small>
								</div>
								<Button variant="outline" size="sm">
									Setup
								</Button>
							</div>

							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="fw-medium mb-1">
										Biometric Login
									</h6>
									<small className="text-muted">
										Use fingerprint or face recognition
									</small>
								</div>
								<div className="form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										checked={
											profileData.security
												.biometricEnabled
										}
										onChange={(e) =>
											handleInputChange(
												"security",
												"biometricEnabled",
												e.target.checked
											)
										}
									/>
								</div>
							</div>
						</Card>
					</div>

					<div className="col-lg-4">
						<Card>
							<h6 className="fw-medium mb-3">
								Security Overview
							</h6>
							<div className="list-group list-group-flush">
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<span>Password Strength</span>
									<span className="badge bg-success">
										Strong
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<span>Two-Factor Auth</span>
									<span
										className={`badge ${
											profileData.security
												.twoFactorEnabled
												? "bg-success"
												: "bg-warning"
										}`}
									>
										{profileData.security.twoFactorEnabled
											? "Enabled"
											: "Disabled"}
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<span>Login Notifications</span>
									<span
										className={`badge ${
											profileData.security
												.loginNotifications
												? "bg-success"
												: "bg-secondary"
										}`}
									>
										{profileData.security.loginNotifications
											? "On"
											: "Off"}
									</span>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
									<span>Last Login</span>
									<small className="text-muted">
										2 hours ago
									</small>
								</div>
							</div>
						</Card>

						<Card>
							<h6 className="fw-medium mb-3">
								Recent Security Activity
							</h6>
							<div className="small">
								<div className="d-flex justify-content-between mb-2">
									<span>Password changed</span>
									<span className="text-muted">
										2 days ago
									</span>
								</div>
								<div className="d-flex justify-content-between mb-2">
									<span>New device login</span>
									<span className="text-muted">
										1 week ago
									</span>
								</div>
								<div className="d-flex justify-content-between">
									<span>2FA enabled</span>
									<span className="text-muted">
										2 weeks ago
									</span>
								</div>
							</div>
						</Card>
					</div>
				</>
			)}

			{/* Preferences Tab */}
			{activeTab === "preferences" && (
				<>
					<div className="col-lg-8">
						<Card>
							<h5 className="fw-medium mb-4">
								General Preferences
							</h5>
							<div className="row g-3">
								<div className="col-md-6">
									<label className="form-label">
										Language
									</label>
									<select
										className="form-select"
										value={profileData.preferences.language}
										onChange={(e) =>
											handleInputChange(
												"preferences",
												"language",
												e.target.value
											)
										}
									>
										<option value="English">English</option>
										<option value="Spanish">Español</option>
										<option value="French">Français</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className="form-label">
										Currency
									</label>
									<select
										className="form-select"
										value={profileData.preferences.currency}
										onChange={(e) =>
											handleInputChange(
												"preferences",
												"currency",
												e.target.value
											)
										}
									>
										<option value="USD">
											USD - US Dollar
										</option>
										<option value="EUR">EUR - Euro</option>
										<option value="GBP">
											GBP - British Pound
										</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className="form-label">
										Timezone
									</label>
									<select
										className="form-select"
										value={profileData.preferences.timezone}
										onChange={(e) =>
											handleInputChange(
												"preferences",
												"timezone",
												e.target.value
											)
										}
									>
										<option value="Eastern Time (UTC-5)">
											Eastern Time (UTC-5)
										</option>
										<option value="Central Time (UTC-6)">
											Central Time (UTC-6)
										</option>
										<option value="Mountain Time (UTC-7)">
											Mountain Time (UTC-7)
										</option>
										<option value="Pacific Time (UTC-8)">
											Pacific Time (UTC-8)
										</option>
									</select>
								</div>
								<div className="col-md-6">
									<label className="form-label">
										Statement Delivery
									</label>
									<select
										className="form-select"
										value={
											profileData.preferences.statements
										}
										onChange={(e) =>
											handleInputChange(
												"preferences",
												"statements",
												e.target.value
											)
										}
									>
										<option value="email">Email</option>
										<option value="mail">
											Physical Mail
										</option>
										<option value="both">Both</option>
									</select>
								</div>
							</div>
						</Card>

						<Card>
							<h5 className="fw-medium mb-4">
								Notification Preferences
							</h5>
							<div className="list-group list-group-flush">
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<div>
										<h6 className="fw-medium mb-1">
											Email Notifications
										</h6>
										<small className="text-muted">
											Account activity, statements, and
											updates
										</small>
									</div>
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											checked={
												profileData.preferences
													.emailAlerts
											}
											onChange={(e) =>
												handleInputChange(
													"preferences",
													"emailAlerts",
													e.target.checked
												)
											}
										/>
									</div>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<div>
										<h6 className="fw-medium mb-1">
											SMS Alerts
										</h6>
										<small className="text-muted">
											Transaction alerts and security
											notifications
										</small>
									</div>
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											checked={
												profileData.preferences
													.smsAlerts
											}
											onChange={(e) =>
												handleInputChange(
													"preferences",
													"smsAlerts",
													e.target.checked
												)
											}
										/>
									</div>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0">
									<div>
										<h6 className="fw-medium mb-1">
											Push Notifications
										</h6>
										<small className="text-muted">
											Mobile app notifications
										</small>
									</div>
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											checked={
												profileData.preferences
													.pushNotifications
											}
											onChange={(e) =>
												handleInputChange(
													"preferences",
													"pushNotifications",
													e.target.checked
												)
											}
										/>
									</div>
								</div>
								<div className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
									<div>
										<h6 className="fw-medium mb-1">
											Marketing Communications
										</h6>
										<small className="text-muted">
											Promotional offers and product
											updates
										</small>
									</div>
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											checked={
												profileData.preferences
													.marketing
											}
											onChange={(e) =>
												handleInputChange(
													"preferences",
													"marketing",
													e.target.checked
												)
											}
										/>
									</div>
								</div>
							</div>
						</Card>
					</div>

					<div className="col-lg-4">
						<Card>
							<h6 className="fw-medium mb-3">Privacy Settings</h6>
							<div className="d-grid gap-2 mb-3">
								<Button variant="outline" size="sm">
									<Download size={14} className="me-2" />
									Download My Data
								</Button>
								<Button variant="outline" size="sm">
									<Shield size={14} className="me-2" />
									Privacy Policy
								</Button>
								<Button variant="outline" size="sm">
									<Globe size={14} className="me-2" />
									Cookie Preferences
								</Button>
							</div>
						</Card>

						<Card>
							<h6 className="fw-medium mb-3">Account Actions</h6>
							<div className="d-grid gap-2">
								<Button variant="outline" size="sm">
									Export Account Data
								</Button>
								<Button variant="outline" size="sm">
									Deactivate Account
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="text-danger border-danger"
								>
									Close Account
								</Button>
							</div>
							<small className="text-muted d-block mt-2">
								Account closure is permanent and cannot be
								undone.
							</small>
						</Card>
					</div>
				</>
			)}
		</div>
	);
};

export default Profile;
