import { Edit3, Save, X } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PersonalInfoTab = ({
	personalData,
	editMode,
	onEdit,
	onSave,
	onCancel,
	onInputChange,
}) => {
	const fields = [
		{ key: "firstName", label: "First Name", type: "text" },
		{ key: "lastName", label: "Last Name", type: "text" },
		{ key: "email", label: "Email Address", type: "email" },
		{ key: "phone", label: "Phone Number", type: "tel" },
		{ key: "dateOfBirth", label: "Date of Birth", type: "date" },
		{
			key: "ssn",
			label: "Social Security Number",
			type: "text",
			readonly: true,
		},
	];

	return (
		<div className="col-12">
			<Card>
				<h5 className="fw-medium mb-4">Personal Information</h5>
				<div className="row g-4">
					{fields.map((field) => {
						const isEditing = editMode[`personal.${field.key}`];
						const value = personalData[field.key];

						return (
							<div key={field.key} className="col-md-6">
								<label className="form-label">
									{field.label}
								</label>
								<div className="d-flex align-items-center gap-2">
									{isEditing && !field.readonly ? (
										<>
											<Input
												type={field.type}
												value={value}
												onChange={(e) =>
													onInputChange(
														"personal",
														field.key,
														e.target.value
													)
												}
												className="flex-grow-1"
											/>
											<Button
												variant="success"
												size="sm"
												onClick={() =>
													onSave(
														"personal",
														field.key
													)
												}
											>
												<Save size={14} />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													onCancel(
														"personal",
														field.key,
														value
													)
												}
											>
												<X size={14} />
											</Button>
										</>
									) : (
										<>
											<Input
												type={field.type}
												value={value}
												readOnly
												className="flex-grow-1"
											/>
											{!field.readonly && (
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														onEdit(
															"personal",
															field.key
														)
													}
												>
													<Edit3 size={14} />
												</Button>
											)}
										</>
									)}
								</div>
								{field.key === "ssn" && (
									<small className="text-muted">
										For security, only the last 4 digits are
										shown
									</small>
								)}
							</div>
						);
					})}
				</div>
			</Card>
		</div>
	);
};

export default PersonalInfoTab;
