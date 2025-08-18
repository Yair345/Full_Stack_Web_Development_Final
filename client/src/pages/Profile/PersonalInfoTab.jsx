import { Edit3, Save, X } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PersonalInfoTab = ({
	personalData,
	editMode,
	tempData,
	onEdit,
	onSave,
	onCancel,
	onInputChange,
}) => {
	const fields = [
		{ key: "firstName", label: "First Name", type: "text", readonly: true },
		{ key: "lastName", label: "Last Name", type: "text", readonly: true },
		{ key: "username", label: "Username", type: "text" },
		{ key: "email", label: "Email Address", type: "email", readonly: true },
		{ key: "phone", label: "Phone Number", type: "tel" },
		{
			key: "dateOfBirth",
			label: "Date of Birth",
			type: "date",
			readonly: true,
		},
		{
			key: "nationalId",
			label: "National ID",
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
						const key = `personal.${field.key}`;
						const value = isEditing
							? tempData[key]
							: personalData[field.key];

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
								{field.key === "nationalId" && (
									<small className="text-muted">
										For security, your national ID cannot be
										changed here
									</small>
								)}
								{field.key === "firstName" && (
									<small className="text-muted">
										Contact support to change your first
										name
									</small>
								)}
								{field.key === "lastName" && (
									<small className="text-muted">
										Contact support to change your last name
									</small>
								)}
								{field.key === "email" && (
									<small className="text-muted">
										Contact support to change your email
										address
									</small>
								)}
								{field.key === "dateOfBirth" && (
									<small className="text-muted">
										Your date of birth cannot be changed
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
