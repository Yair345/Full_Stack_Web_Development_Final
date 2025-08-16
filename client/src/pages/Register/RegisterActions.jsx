import { Link } from "react-router-dom";

const RegisterActions = () => {
	return (
		<div className="text-center">
			<p className="mb-0">
				Already have an account?{" "}
				<Link to="/login" className="text-decoration-none fw-medium">
					Sign in here
				</Link>
			</p>
		</div>
	);
};

export default RegisterActions;
