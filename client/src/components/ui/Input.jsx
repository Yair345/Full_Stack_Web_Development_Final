import { forwardRef } from "react";
import { classNames } from "../../utils/helpers";

const Input = forwardRef(
	(
		{ label, error, type = "text", className = "", required, ...props },
		ref
	) => {
		const inputStyles = classNames(
			"form-control",
			error && "is-invalid",
			className
		);

		return (
			<div className="mb-3">
				{label && (
					<label className="form-label">
						{label}{" "}
						{required && <span className="text-danger">*</span>}
					</label>
				)}
				<input
					ref={ref}
					type={type}
					className={inputStyles}
					required={required}
					{...props}
				/>
				{error && <div className="invalid-feedback">{error}</div>}
			</div>
		);
	}
);

Input.displayName = "Input";

export default Input;
