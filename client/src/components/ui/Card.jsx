import { classNames } from "../../utils/helpers";

const Card = ({ children, className = "", padding = true, ...props }) => {
	return (
		<div
			className={classNames(
				"bg-white rounded-lg shadow-md border border-gray-200",
				padding && "p-6",
				className
			)}
			{...props}
		>
			{children}
		</div>
	);
};

export default Card;
