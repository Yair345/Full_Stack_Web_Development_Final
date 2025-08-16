import { Link } from "react-router-dom";

const DemoActions = ({ onDemoLogin }) => {
	return (
		<>
			<div className="d-grid mb-3">
				<button
					type="button"
					onClick={onDemoLogin}
					className="btn btn-outline-secondary"
				>
					Quick Demo Login
				</button>
			</div>

			<div className="text-center mb-3">
				<p className="small text-muted">
					Demo credentials: customer@demo.com, manager@demo.com,
					admin@demo.com (any password)
				</p>
			</div>

			<div className="text-center">
				<p className="mb-0">
					Don't have an account?{" "}
					<Link
						to="/register"
						className="text-decoration-none fw-medium"
					>
						Create one here
					</Link>
				</p>
			</div>
		</>
	);
};

export default DemoActions;
