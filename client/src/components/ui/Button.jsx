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
			"inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

		const variants = {
			primary:
				"bg-bank-blue-600 hover:bg-bank-blue-700 text-white focus:ring-bank-blue-500",
			secondary:
				"bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500",
			success:
				"bg-bank-green-600 hover:bg-bank-green-700 text-white focus:ring-bank-green-500",
			danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
			outline:
				"border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-bank-blue-500",
		};

		const sizes = {
			sm: "px-3 py-1.5 text-sm",
			md: "px-4 py-2 text-sm",
			lg: "px-6 py-3 text-base",
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
					<svg
						className="animate-spin -ml-1 mr-2 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				)}
				{children}
			</button>
		);
	}
);

Button.displayName = "Button";

export default Button;
