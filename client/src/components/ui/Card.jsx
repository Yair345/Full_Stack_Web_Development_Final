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

export default Card;
