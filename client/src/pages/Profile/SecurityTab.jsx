import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { getPasswordStrength, validatePassword } from "./profileUtils";

const SecurityTab = ({ onPasswordChange }) => {
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState({});

	const handleTogglePassword = (field) => {
		setShowPassword((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const handlePasswordFormChange = (field, value) => {
		setPasswordForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePasswordSubmit = (e) => {
		e.preventDefault();
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			alert("Passwords don't match");
			return;
		}
		onPasswordChange(passwordForm);
		setPasswordForm({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
		setShowPasswordForm(false);
	};

	const passwordStrength = getPasswordStrength(passwordForm.newPassword);

	return (
		<div className="col-12">
			<div className="row g-4">
				{/* Security Settings */}
				<div className="col-lg-6">
					<Card>
						<h5 className="fw-medium mb-4">Security Settings</h5>

						<div className="mb-4">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<span>Login Password</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setShowPasswordForm(!showPasswordForm)
									}
								>
									Change Password
								</Button>
							</div>
							<Input value="••••••••" readOnly />
							<small className="text-muted">
								Last updated: Contact support for password
								history
							</small>
						</div>
					</Card>
				</div>

				{/* Change Password Form */}
				{showPasswordForm && (
					<div className="col-lg-6">
						<Card>
							<h5 className="fw-medium mb-4">
								<Shield size={20} className="me-2" />
								Change Password
							</h5>

							<form onSubmit={handlePasswordSubmit}>
								<div className="mb-3">
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
											value={passwordForm.currentPassword}
											onChange={(e) =>
												handlePasswordFormChange(
													"currentPassword",
													e.target.value
												)
											}
											required
										/>
										<button
											type="button"
											className="btn btn-outline-secondary"
											onClick={() =>
												handleTogglePassword("current")
											}
										>
											{showPassword.current ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</button>
									</div>
								</div>

								<div className="mb-3">
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
												handlePasswordFormChange(
													"newPassword",
													e.target.value
												)
											}
											required
										/>
										<button
											type="button"
											className="btn btn-outline-secondary"
											onClick={() =>
												handleTogglePassword("new")
											}
										>
											{showPassword.new ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</button>
									</div>
									{passwordForm.newPassword && (
										<div className="mt-2">
											<div className="d-flex align-items-center gap-2">
												<div className="flex-grow-1">
													<div
														className="progress"
														style={{
															height: "4px",
														}}
													>
														<div
															className={`progress-bar bg-${passwordStrength.color}`}
															style={{
																width: `${
																	(Object.values(
																		validatePassword(
																			passwordForm.newPassword
																		)
																	).filter(
																		Boolean
																	).length /
																		5) *
																	100
																}%`,
															}}
														></div>
													</div>
												</div>
												<small
													className={`text-${passwordStrength.color}`}
												>
													{passwordStrength.strength}
												</small>
											</div>
										</div>
									)}
								</div>

								<div className="mb-4">
									<label className="form-label">
										Confirm New Password
									</label>
									<div className="input-group">
										<Input
											type={
												showPassword.confirm
													? "text"
													: "password"
											}
											value={passwordForm.confirmPassword}
											onChange={(e) =>
												handlePasswordFormChange(
													"confirmPassword",
													e.target.value
												)
											}
											required
										/>
										<button
											type="button"
											className="btn btn-outline-secondary"
											onClick={() =>
												handleTogglePassword("confirm")
											}
										>
											{showPassword.confirm ? (
												<EyeOff size={16} />
											) : (
												<Eye size={16} />
											)}
										</button>
									</div>
									{passwordForm.confirmPassword &&
										passwordForm.newPassword !==
											passwordForm.confirmPassword && (
											<small className="text-danger">
												Passwords don't match
											</small>
										)}
								</div>

								<div className="d-flex gap-2">
									<Button type="submit" variant="primary">
										Update Password
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											setShowPasswordForm(false)
										}
									>
										Cancel
									</Button>
								</div>
							</form>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
};

export default SecurityTab;
