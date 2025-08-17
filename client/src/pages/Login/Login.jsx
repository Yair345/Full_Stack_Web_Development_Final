import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
	loginStart,
	loginSuccess,
	loginFailure,
} from "../../store/slices/authSlice";
import { useAuthMutations } from "../../hooks/api/apiHooks";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import DemoActions from "./DemoActions";
import {
	createMockUser,
	getMockToken,
	demoCredentials,
	simulateApiDelay,
} from "./loginUtils";

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
	const { login } = useAuthMutations();

	// Use loading state from both Redux and the login mutation
	const isLoading = loading || login.loading;

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

	const handlePasswordToggle = () => {
		setShowPassword(!showPassword);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch(loginStart());

		try {
			// Make actual API call to server
			const response = await login.mutate({
				email: formData.email,
				password: formData.password,
			});

			// Extract user and token from server response
			const { user, tokens } = response.data;

			// Transform server field names to match client expectations
			const transformedUser = {
				...user,
				firstName: user.first_name,
				lastName: user.last_name,
			};

			dispatch(
				loginSuccess({
					user: transformedUser,
					token: tokens.accessToken,
					refreshToken: tokens.refreshToken,
				})
			);
		} catch (err) {
			const errorMessage =
				err.message || "Login failed. Please try again.";
			dispatch(loginFailure(errorMessage));
		}
	};

	const handleDemoLogin = async () => {
		setFormData(demoCredentials);
		dispatch(loginStart());

		try {
			// Use real API call for demo login as well
			const response = await login.mutate({
				email: demoCredentials.email,
				password: demoCredentials.password,
			});

			// Extract user and token from server response
			const { user, tokens } = response.data;

			// Transform server field names to match client expectations
			const transformedUser = {
				...user,
				firstName: user.first_name,
				lastName: user.last_name,
			};

			dispatch(
				loginSuccess({
					user: transformedUser,
					token: tokens.accessToken,
					refreshToken: tokens.refreshToken,
				})
			);
		} catch (err) {
			// Fallback to mock data if server is not available or demo user doesn't exist
			console.warn("Demo login failed, using mock data:", err.message);
			const mockUser = createMockUser(demoCredentials.email);
			const mockToken = getMockToken();
			dispatch(loginSuccess({ user: mockUser, token: mockToken }));
		}
	};

	return (
		<div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-4">
						<div className="card card-custom shadow-sm">
							<div className="card-body p-4 p-md-5">
								<LoginHeader />
								<LoginForm
									formData={formData}
									showPassword={showPassword}
									loading={isLoading}
									error={error}
									onFormChange={handleChange}
									onPasswordToggle={handlePasswordToggle}
									onSubmit={handleSubmit}
								/>
								<DemoActions onDemoLogin={handleDemoLogin} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
