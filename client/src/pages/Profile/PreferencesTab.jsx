import { useState } from "react";
import { Bell, Mail, Smartphone, Globe, Moon, Sun } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const PreferencesTab = ({ preferencesData, onPreferencesChange }) => {
	return (
		<div className="col-12">
			<div className="row g-4">
				{/* Notification Preferences */}
				<div className="col-lg-6">
					<Card>
						<h5 className="fw-medium mb-4">
							<Bell size={20} className="me-2" />
							Notification Preferences
						</h5>

						<div className="mb-3">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									checked={preferencesData.emailNotifications}
									onChange={(e) =>
										onPreferencesChange(
											"emailNotifications",
											e.target.checked
										)
									}
								/>
								<label className="form-check-label">
									<Mail size={16} className="me-2" />
									Email Notifications
								</label>
							</div>
							<small className="text-muted">
								Receive account updates and transaction alerts
								via email
							</small>
						</div>

						<div className="mb-3">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									checked={preferencesData.smsNotifications}
									onChange={(e) =>
										onPreferencesChange(
											"smsNotifications",
											e.target.checked
										)
									}
								/>
								<label className="form-check-label">
									<Smartphone size={16} className="me-2" />
									SMS Notifications
								</label>
							</div>
							<small className="text-muted">
								Get important alerts and verification codes via
								SMS
							</small>
						</div>

						<div className="mb-3">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									checked={preferencesData.pushNotifications}
									onChange={(e) =>
										onPreferencesChange(
											"pushNotifications",
											e.target.checked
										)
									}
								/>
								<label className="form-check-label">
									Push Notifications
								</label>
							</div>
							<small className="text-muted">
								Receive real-time notifications in your browser
							</small>
						</div>

						<div className="mb-3">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									checked={preferencesData.marketingEmails}
									onChange={(e) =>
										onPreferencesChange(
											"marketingEmails",
											e.target.checked
										)
									}
								/>
								<label className="form-check-label">
									Marketing Communications
								</label>
							</div>
							<small className="text-muted">
								Receive offers, promotions, and product updates
							</small>
						</div>

						<div className="mb-3">
							<label className="form-label">
								Transaction Alert Threshold
							</label>
							<select
								className="form-select"
								value={preferencesData.alertThreshold}
								onChange={(e) =>
									onPreferencesChange(
										"alertThreshold",
										e.target.value
									)
								}
							>
								<option value="100">$100+</option>
								<option value="500">$500+</option>
								<option value="1000">$1,000+</option>
								<option value="5000">$5,000+</option>
							</select>
							<small className="text-muted">
								Get notified for transactions above this amount
							</small>
						</div>
					</Card>
				</div>

				{/* Display & Accessibility */}
				<div className="col-lg-6">
					<Card>
						<h5 className="fw-medium mb-4">
							<Globe size={20} className="me-2" />
							Display & Accessibility
						</h5>

						<div className="mb-3">
							<label className="form-label">Language</label>
							<select
								className="form-select"
								value={preferencesData.language}
								onChange={(e) =>
									onPreferencesChange(
										"language",
										e.target.value
									)
								}
							>
								<option value="en">English</option>
								<option value="es">Español</option>
								<option value="fr">Français</option>
								<option value="de">Deutsch</option>
								<option value="zh">中文</option>
							</select>
						</div>

						<div className="mb-3">
							<label className="form-label">Timezone</label>
							<select
								className="form-select"
								value={preferencesData.timezone}
								onChange={(e) =>
									onPreferencesChange(
										"timezone",
										e.target.value
									)
								}
							>
								<option value="EST">Eastern Time (EST)</option>
								<option value="CST">Central Time (CST)</option>
								<option value="MST">Mountain Time (MST)</option>
								<option value="PST">Pacific Time (PST)</option>
								<option value="UTC">UTC</option>
							</select>
						</div>

						<div className="mb-3">
							<label className="form-label">
								Currency Display
							</label>
							<select
								className="form-select"
								value={preferencesData.currency}
								onChange={(e) =>
									onPreferencesChange(
										"currency",
										e.target.value
									)
								}
							>
								<option value="USD">US Dollar ($)</option>
								<option value="EUR">Euro (€)</option>
								<option value="GBP">British Pound (£)</option>
								<option value="CAD">
									Canadian Dollar (C$)
								</option>
								<option value="JPY">Japanese Yen (¥)</option>
							</select>
						</div>

						<div className="mb-3">
							<label className="form-label">Date Format</label>
							<select
								className="form-select"
								value={preferencesData.dateFormat}
								onChange={(e) =>
									onPreferencesChange(
										"dateFormat",
										e.target.value
									)
								}
							>
								<option value="MM/DD/YYYY">MM/DD/YYYY</option>
								<option value="DD/MM/YYYY">DD/MM/YYYY</option>
								<option value="YYYY-MM-DD">YYYY-MM-DD</option>
							</select>
						</div>

						<div className="mb-3">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									checked={preferencesData.darkMode}
									onChange={(e) =>
										onPreferencesChange(
											"darkMode",
											e.target.checked
										)
									}
								/>
								<label className="form-check-label">
									{preferencesData.darkMode ? (
										<Moon size={16} className="me-2" />
									) : (
										<Sun size={16} className="me-2" />
									)}
									Dark Mode
								</label>
							</div>
							<small className="text-muted">
								Switch to dark theme for better viewing in low
								light
							</small>
						</div>

						<div className="mb-3">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									checked={preferencesData.reducedMotion}
									onChange={(e) =>
										onPreferencesChange(
											"reducedMotion",
											e.target.checked
										)
									}
								/>
								<label className="form-check-label">
									Reduced Motion
								</label>
							</div>
							<small className="text-muted">
								Minimize animations and transitions for better
								accessibility
							</small>
						</div>

						<div className="mb-3">
							<label className="form-label">Font Size</label>
							<select
								className="form-select"
								value={preferencesData.fontSize}
								onChange={(e) =>
									onPreferencesChange(
										"fontSize",
										e.target.value
									)
								}
							>
								<option value="small">Small</option>
								<option value="medium">Medium</option>
								<option value="large">Large</option>
								<option value="extra-large">Extra Large</option>
							</select>
						</div>
					</Card>
				</div>

				{/* Privacy & Data */}
				<div className="col-12">
					<Card>
						<h5 className="fw-medium mb-4">Privacy & Data</h5>

						<div className="row">
							<div className="col-md-6">
								<div className="mb-3">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											checked={
												preferencesData.dataSharing
											}
											onChange={(e) =>
												onPreferencesChange(
													"dataSharing",
													e.target.checked
												)
											}
										/>
										<label className="form-check-label">
											Allow Data Sharing
										</label>
									</div>
									<small className="text-muted">
										Share anonymized data for service
										improvement
									</small>
								</div>

								<div className="mb-3">
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											checked={
												preferencesData.analyticsTracking
											}
											onChange={(e) =>
												onPreferencesChange(
													"analyticsTracking",
													e.target.checked
												)
											}
										/>
										<label className="form-check-label">
											Analytics Tracking
										</label>
									</div>
									<small className="text-muted">
										Help us improve your experience with
										usage analytics
									</small>
								</div>
							</div>

							<div className="col-md-6">
								<div className="mb-3">
									<label className="form-label">
										Data Retention Period
									</label>
									<select
										className="form-select"
										value={preferencesData.dataRetention}
										onChange={(e) =>
											onPreferencesChange(
												"dataRetention",
												e.target.value
											)
										}
									>
										<option value="1year">1 Year</option>
										<option value="2years">2 Years</option>
										<option value="5years">5 Years</option>
										<option value="7years">
											7 Years (Recommended)
										</option>
									</select>
									<small className="text-muted">
										How long to keep your transaction
										history
									</small>
								</div>

								<div className="mb-3">
									<Button variant="outline" size="sm">
										Download My Data
									</Button>
									<br />
									<small className="text-muted">
										Get a copy of all your account data
									</small>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default PreferencesTab;
