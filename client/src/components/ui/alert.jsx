import React from "react";

const Alert = ({ children, variant = "default", className = "", ...props }) => {
	const baseClasses =
		"relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-gray-950";

	const variantClasses = {
		default: "bg-white text-gray-950 border-gray-200",
		destructive:
			"border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600",
		success:
			"border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600",
		warning:
			"border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600",
	};

	const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

	return (
		<div role="alert" className={classes} {...props}>
			{children}
		</div>
	);
};

const AlertDescription = ({ children, className = "", ...props }) => {
	return (
		<div
			className={`text-sm [&_p]:leading-relaxed ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

export { Alert, AlertDescription };
