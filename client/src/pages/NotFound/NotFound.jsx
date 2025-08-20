import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
	return (
		<div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-lg-6 col-md-8">
						<div className="text-center">
							<div className="mb-4">
								<h1 className="display-1 text-primary fw-bold">
									404
								</h1>
								<h2 className="h3 text-dark mb-3">
									Page Not Found
								</h2>
								<p className="text-muted mb-4">
									Sorry, the page you are looking for doesn't
									exist or has been moved.
								</p>
							</div>

							<div className="d-flex gap-3 justify-content-center">
								<Link
									to="/dashboard"
									className="btn btn-primary d-flex align-items-center gap-2"
								>
									<Home size={18} />
									Go to Dashboard
								</Link>

								<button
									onClick={() => window.history.back()}
									className="btn btn-outline-secondary d-flex align-items-center gap-2"
								>
									<ArrowLeft size={18} />
									Go Back
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
