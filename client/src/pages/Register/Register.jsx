import { useState, useEffect } from "react";
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
	getInitialFormState,
	generateUsername,
} from "./registerUtils";
import { authAPI } from "../../services/api";

const Register = () => {
	const [formData, setFormData] = useState(getInitialFormState());
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const [branches, setBranches] = useState([]);
	const [loadingBranches, setLoadingBranches] = useState(true);

	const { loading, isAuthenticated } = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { register } = useAuthMutations();

	// Use loading state from both Redux and the register mutation
	const isLoading = loading || register.loading;

	// Fetch available branches
	useEffect(() => {
		const fetchBranches = async () => {
			try {
				setLoadingBranches(true);
				const response = await authAPI.getBranches();
				setBranches(response.data.branches || []);
			} catch (error) {
				console.error("Error fetching branches:", error);
				// Don't fail registration if branches can't be loaded
			} finally {
				setLoadingBranches(false);
			}
		};

		fetchBranches();
	}, []);

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
				username: generateUsername(
					formData.firstName,
					formData.lastName
				),
				email: formData.email,
				password: formData.password,
				first_name: formData.firstName,
				last_name: formData.lastName,
				phone: formData.phone,
				date_of_birth: formData.dateOfBirth,
				national_id: formData.nationalId,
				address: formData.address,
				branch_id: formData.branchId || null,
			});

			// Extract user and token from server response
			const { user, tokens } = response.data;

			// Transform server field names to match client expectations
			const transformedUser = {
				...user,
				firstName: user.first_name,
				lastName: user.last_name,
			};

			// Auto-login the user after successful registration
			dispatch(
				loginSuccess({
					user: transformedUser,
					token: tokens.accessToken,
					refreshToken: tokens.refreshToken,
				})
			);

			// If user is pending approval, redirect to waiting page
			if (user.approval_status === "pending") {
				navigate("/waiting");
			}

			// Show success message (optional)
			console.log("Registration successful:", user);
		} catch (err) {
			console.error("Registration error:", err);
			const errorMessage =
				err.message || "Registration failed. Please try again.";
			dispatch(loginFailure(errorMessage));

			// Handle specific validation errors from server
			if (err.response?.data?.errors) {
				// Handle field-specific validation errors
				const serverErrors = {};
				err.response.data.errors.forEach((error) => {
					// Map server field names to client field names
					let fieldName = error.field;
					if (fieldName === "national_id") {
						fieldName = "nationalId";
					} else if (fieldName === "first_name") {
						fieldName = "firstName";
					} else if (fieldName === "last_name") {
						fieldName = "lastName";
					}

					// For username conflicts, show on firstName field since username is auto-generated
					if (fieldName === "username") {
						serverErrors.firstName =
							"There was an issue creating your account. Please try again or modify your name slightly.";
					} else {
						serverErrors[fieldName] = error.message;
					}
				});
				setErrors(serverErrors);
			} else if (err.message && err.message.includes("already exists")) {
				// Fallback for old-style error messages
				const message = err.message.toLowerCase();
				const newErrors = {};

				if (message.includes("email")) {
					newErrors.email =
						"An account with this email already exists. Please try logging in instead.";
				}
				if (message.includes("username")) {
					newErrors.firstName =
						"There was an issue creating your account. Please try again or modify your name slightly.";
				}
				if (message.includes("national id")) {
					newErrors.nationalId =
						"An account with this National ID already exists. Please contact support if you believe this is an error.";
				}

				// If we can't determine the specific field, show generic message on email field
				if (Object.keys(newErrors).length === 0) {
					newErrors.email =
						"An account with this information already exists. Please check your email or National ID.";
				}

				setErrors(newErrors);
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
									branches={branches}
									loadingBranches={loadingBranches}
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
