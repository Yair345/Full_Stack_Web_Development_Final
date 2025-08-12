import { forwardRef } from "react";
import { classNames } from "../../utils/helpers";

const Input = forwardRef(
	({ label, error, type = "text", className = "", ...props }, ref) => {
		const inputStyles = classNames(
			"block w-full rounded-md shadow-sm transition-colors duration-200",
			error
				? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
				: "border-gray-300 focus:border-bank-blue-500 focus:ring-bank-blue-500",
			className
		);

		return (
			<div>
				{label && (
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{label}
					</label>
				)}
				<input
					ref={ref}
					type={type}
					className={inputStyles}
					{...props}
				/>
				{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
			</div>
		);
	}
);

Input.displayName = "Input";

export default Input;
