import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import {
	loginStart,
	loginSuccess,
	loginFailure,
} from "../../store/slices/authSlice";
import { useAuthMutations } from "../../hooks/api/apiHooks";
import RegisterHeader from "./RegisterHeader";
import RegisterForm from "./RegisterForm";
import RegisterActions from "./RegisterActions";
import {
	validateRegisterForm,
	createRegisteredUser,
	generateMockToken,
	simulateRegistrationDelay,
	checkEmailExists,
	getInitialFormState,
} from "./registerUtils";

const Register = () => {
	const [formData, setFormData] = useState(getInitialFormState());
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({});

	const { loading, isAuthenticated } = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { register } = useAuthMutations();

	// Use loading state from both Redux and the register mutation
	const isLoading = loading || register.loading;

	// Redirect if already authenticated
	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));

		// Clear error for the field being edited
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handlePasswordToggle = () => {
		setShowPassword(!showPassword);
	};

	const handleConfirmPasswordToggle = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate form
		const validation = validateRegisterForm(formData);

		if (!validation.isValid) {
			setErrors(validation.errors);
			return;
		}

		dispatch(loginStart());
		setErrors({});

		try {
			// Make actual API call to server
			const response = await register.mutate({
				username: formData.email, // Using email as username for now
				email: formData.email,
				password: formData.password,
				first_name: formData.firstName,
				last_name: formData.lastName,
				phone: formData.phone,
				date_of_birth: formData.dateOfBirth,
				national_id: formData.nationalId,
				address: formData.address,
			});

			// Extract user and token from server response
			const { user, tokens } = response.data;

			// Auto-login the user after successful registration
			dispatch(
				loginSuccess({
					user,
					token: tokens.accessToken,
					refreshToken: tokens.refreshToken,
				})
			);

			// Show success message (optional)
			console.log("Registration successful:", user);
		} catch (err) {
			const errorMessage =
				err.message || "Registration failed. Please try again.";
			dispatch(loginFailure(errorMessage));

			// Handle specific validation errors from server
			if (err.message && err.message.includes("already exists")) {
				setErrors({
					email: "An account with this email already exists. Please try logging in instead.",
				});
			}
		}
	};

	return (
		<div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
						<div className="card card-custom shadow-sm">
							<div className="card-body p-4 p-md-5">
								<RegisterHeader />
								<RegisterForm
									formData={formData}
									showPassword={showPassword}
									showConfirmPassword={showConfirmPassword}
									loading={isLoading}
									errors={errors}
									onFormChange={handleChange}
									onPasswordToggle={handlePasswordToggle}
									onConfirmPasswordToggle={
										handleConfirmPasswordToggle
									}
									onSubmit={handleSubmit}
								/>
								<RegisterActions />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;
