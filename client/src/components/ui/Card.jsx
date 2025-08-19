import { classNames } from "../../utils/helpers";

const Card = ({ children, className = "", padding = true, ...props }) => {
	return (
		<div
			className={classNames(
				"card card-custom",
				padding && "card-body",
				className
			)}
			{...props}
		>
			{children}
		</div>
	);
};

const CardHeader = ({ children, className = "", ...props }) => {
	return (
		<div className={classNames("card-header", className)} {...props}>
			{children}
		</div>
	);
};

const CardTitle = ({ children, className = "", ...props }) => {
	return (
		<h3 className={classNames("card-title mb-0", className)} {...props}>
			{children}
		</h3>
	);
};

const CardDescription = ({ children, className = "", ...props }) => {
	return (
		<p
			className={classNames("card-text text-muted mb-0", className)}
			{...props}
		>
			{children}
		</p>
	);
};

const CardContent = ({ children, className = "", ...props }) => {
	return (
		<div className={classNames("card-body", className)} {...props}>
			{children}
		</div>
	);
};

export default Card;
export { Card, CardHeader, CardTitle, CardDescription, CardContent };
