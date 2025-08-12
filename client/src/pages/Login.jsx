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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<div className="flex justify-center">
						<div className="flex items-center">
							<div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
								<Building2 className="h-8 w-8 text-white" />
							</div>
							<h1 className="ml-3 text-3xl font-bold text-gray-900">
								SecureBank
							</h1>
						</div>
					</div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Welcome back to SecureBank Online Banking
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email" className="sr-only">
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div className="relative">
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-0 pr-3 flex items-center"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-5 w-5 text-gray-400" />
								) : (
									<Eye className="h-5 w-5 text-gray-400" />
								)}
							</button>
						</div>
					</div>

					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>

					<div className="text-center">
						<p className="text-sm text-gray-600">
							Demo credentials: customer@demo.com,
							manager@demo.com, admin@demo.com (any password)
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
