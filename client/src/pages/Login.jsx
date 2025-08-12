import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Building2 } from "lucide-react";
import {
	loginStart,
	loginSuccess,
	loginFailure,
} from "../store/slices/authSlice";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	const { loading, error, isAuthenticated } = useSelector(
		(state) => state.auth
	);
	const dispatch = useDispatch();

	// Redirect if already authenticated
	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch(loginStart());

		// Mock login for development
		setTimeout(() => {
			if (formData.email && formData.password) {
				const mockUser = {
					id: 1,
					email: formData.email,
					firstName: "John",
					lastName: "Doe",
					role: formData.email.includes("admin")
						? "admin"
						: formData.email.includes("manager")
						? "manager"
						: "customer",
				};
				const mockToken = "mock-jwt-token";

				dispatch(loginSuccess({ user: mockUser, token: mockToken }));
			} else {
				dispatch(loginFailure("Invalid credentials"));
			}
		}, 1000);
	};

	return (
		<div className="vh-100 d-flex align-items-center justify-content-center bg-light">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-md-6 col-lg-4">
						<div className="card card-custom">
							<div className="card-body p-5">
								<div className="text-center mb-4">
									<div className="d-flex justify-content-center align-items-center mb-3">
										<div
											className="rounded bg-bank-blue d-flex align-items-center justify-content-center me-3"
											style={{
												width: "48px",
												height: "48px",
											}}
										>
											<Building2
												size={32}
												className="text-white"
											/>
										</div>
										<h1 className="h3 fw-bold text-dark mb-0">
											SecureBank
										</h1>
									</div>
									<h2 className="h4 fw-bold text-dark mb-2">
										Sign in to your account
									</h2>
									<p className="text-muted">
										Welcome back to SecureBank Online
										Banking
									</p>
								</div>

								<form onSubmit={handleSubmit}>
									<div className="mb-3">
										<label
											htmlFor="email"
											className="form-label"
										>
											Email address
										</label>
										<input
											id="email"
											name="email"
											type="email"
											autoComplete="email"
											required
											className="form-control"
											placeholder="Email address"
											value={formData.email}
											onChange={handleChange}
										/>
									</div>
									<div className="mb-3">
										<label
											htmlFor="password"
											className="form-label"
										>
											Password
										</label>
										<div className="input-group">
											<input
												id="password"
												name="password"
												type={
													showPassword
														? "text"
														: "password"
												}
												autoComplete="current-password"
												required
												className="form-control"
												placeholder="Password"
												value={formData.password}
												onChange={handleChange}
											/>
											<button
												type="button"
												className="btn btn-outline-secondary"
												onClick={() =>
													setShowPassword(
														!showPassword
													)
												}
											>
												{showPassword ? (
													<EyeOff size={16} />
												) : (
													<Eye size={16} />
												)}
											</button>
										</div>
									</div>

									{error && (
										<div
											className="alert alert-danger"
											role="alert"
										>
											{error}
										</div>
									)}

									<div className="d-grid mb-3">
										<button
											type="submit"
											disabled={loading}
											className="btn btn-bank-primary"
										>
											{loading ? (
												<>
													<span
														className="spinner-border spinner-border-sm me-2"
														role="status"
														aria-hidden="true"
													></span>
													Signing in...
												</>
											) : (
												"Sign in"
											)}
										</button>
									</div>

									<div className="d-grid mb-3">
										<button
											type="button"
											onClick={() => {
												setFormData({
													email: "customer@demo.com",
													password: "demo123",
												});
												const mockUser = {
													id: 1,
													email: "customer@demo.com",
													firstName: "John",
													lastName: "Doe",
													role: "customer",
												};
												const mockToken =
													"mock-jwt-token";
												dispatch(
													loginSuccess({
														user: mockUser,
														token: mockToken,
													})
												);
											}}
											className="btn btn-outline-secondary"
										>
											Quick Demo Login
										</button>
									</div>

									<div className="text-center">
										<p className="small text-muted">
											Demo credentials: customer@demo.com,
											manager@demo.com, admin@demo.com
											(any password)
										</p>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
