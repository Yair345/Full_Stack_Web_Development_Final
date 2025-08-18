import { Edit3, Save, X } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AddressTab = ({
	addressData,
	editMode,
	tempData,
	onEdit,
	onSave,
	onCancel,
	onInputChange,
}) => {
	const fields = [
		{
			key: "street",
			label: "Street Address",
			type: "text",
			colSize: "col-12",
		},
		{ key: "city", label: "City", type: "text", colSize: "col-md-6" },
		{ key: "state", label: "State", type: "text", colSize: "col-md-3" },
		{
			key: "zipCode",
			label: "ZIP Code",
			type: "text",
			colSize: "col-md-3",
		},
		{ key: "country", label: "Country", type: "text", colSize: "col-md-6" },
	];

	return (
		<div className="col-12">
			<Card>
				<h5 className="fw-medium mb-4">Address Information</h5>
				<div className="row g-4">
					{fields.map((field) => {
						const isEditing = editMode[`address.${field.key}`];
						const key = `address.${field.key}`;
						const value = isEditing
							? tempData[key]
							: addressData[field.key];

						return (
							<div key={field.key} className={field.colSize}>
								<label className="form-label">
									{field.label}
								</label>
								<div className="d-flex align-items-center gap-2">
									{isEditing ? (
										<>
											<Input
												type={field.type}
												value={value}
												onChange={(e) =>
													onInputChange(
														"address",
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
													onSave("address", field.key)
												}
											>
												<Save size={14} />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													onCancel(
														"address",
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
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													onEdit("address", field.key)
												}
											>
												<Edit3 size={14} />
											</Button>
										</>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</Card>
		</div>
	);
};

export default AddressTab;
