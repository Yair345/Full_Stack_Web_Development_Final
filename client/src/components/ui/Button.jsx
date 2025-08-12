import { forwardRef } from "react";
import { classNames } from "../../utils/helpers";

const Button = forwardRef(
	(
		{
			children,
			variant = "primary",
			size = "md",
			disabled = false,
			loading = false,
			className = "",
			...props
		},
		ref
	) => {
		const baseStyles =
			"btn d-inline-flex align-items-center justify-content-center";

		const variants = {
			primary: "btn-bank-primary",
			secondary: "btn-secondary",
			success: "btn-bank-success",
			danger: "btn-danger",
			outline: "btn-outline-primary",
		};

		const sizes = {
			sm: "btn-sm",
			md: "",
			lg: "btn-lg",
		};

		return (
			<button
				ref={ref}
				className={classNames(
					baseStyles,
					variants[variant],
					sizes[size],
					className
				)}
				disabled={disabled || loading}
				{...props}
			>
				{loading && (
					<div
						className="spinner-border spinner-border-sm me-2"
						role="status"
						aria-hidden="true"
					></div>
				)}
				{children}
			</button>
		);
	}
);

Button.displayName = "Button";

export default Button;
