import { forwardRef } from "react";
import { classNames } from "../../utils/helpers";

const Input = forwardRef(
	({ label, error, type = "text", className = "", ...props }, ref) => {
		const inputStyles = classNames(
			"form-control",
			error && "is-invalid",
			className
		);

		return (
			<div className="mb-3">
				{label && <label className="form-label">{label}</label>}
				<input
					ref={ref}
					type={type}
					className={inputStyles}
					{...props}
				/>
				{error && <div className="invalid-feedback">{error}</div>}
			</div>
		);
	}
);

Input.displayName = "Input";

export default Input;
