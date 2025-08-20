import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requireApproval = true }) => {
	const { isAuthenticated, token, user } = useSelector((state) => state.auth);
	const location = useLocation();

	// Check if user is authenticated
	if (!isAuthenticated && !token) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Always check for rejected users first - they should NEVER access any protected route
	if (user?.approval_status === "rejected" || user?.is_active === false) {
		return <Navigate to="/rejected" replace />;
	}

	// Admin and managers can access everything regardless of approval status
	if (user?.role === "admin" || user?.role === "manager") {
		return children;
	}

	// If approval is required and user is not approved
	if (requireApproval && user?.approval_status !== "approved") {
		if (user?.approval_status === "pending") {
			return <Navigate to="/waiting" replace />;
		}

		// For backward compatibility, check isBlocked
		if (user?.isBlocked) {
			return <Navigate to="/waiting" replace />;
		}

		// Unknown status - redirect to waiting
		return <Navigate to="/waiting" replace />;
	}

	return children;
};

// Component for waiting page - only allows users with pending status
export const WaitingRoute = ({ children }) => {
	const { isAuthenticated, token, user } = useSelector((state) => state.auth);
	const location = useLocation();

	// Check if user is authenticated
	if (!isAuthenticated && !token) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Admin and managers should go to dashboard
	if (user?.role === "admin" || user?.role === "manager") {
		return <Navigate to="/dashboard" replace />;
	}

	// Approved users should go to dashboard
	if (
		user?.approval_status === "approved" ||
		(!user?.isBlocked && !user?.approval_status)
	) {
		return <Navigate to="/dashboard" replace />;
	}

	// Rejected users should go to rejected page
	if (user?.approval_status === "rejected" || user?.is_active === false) {
		return <Navigate to="/rejected" replace />;
	}

	// Only pending users can access waiting page
	if (user?.approval_status === "pending" || user?.isBlocked) {
		return children;
	}

	// Unknown status - redirect to dashboard for safety (let ProtectedRoute handle it)
	return <Navigate to="/dashboard" replace />;
};

// Component for rejected page - only allows rejected users
export const RejectedRoute = ({ children }) => {
	const { isAuthenticated, token, user } = useSelector((state) => state.auth);
	const location = useLocation();

	// Check if user is authenticated
	if (!isAuthenticated && !token) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Admin and managers should go to dashboard
	if (user?.role === "admin" || user?.role === "manager") {
		return <Navigate to="/dashboard" replace />;
	}

	// Approved users should go to dashboard
	if (
		user?.approval_status === "approved" ||
		(!user?.isBlocked && !user?.approval_status)
	) {
		return <Navigate to="/dashboard" replace />;
	}

	// Pending users should go to waiting page
	if (user?.approval_status === "pending" || user?.isBlocked) {
		return <Navigate to="/waiting" replace />;
	}

	// Only rejected users (or inactive users) can access rejected page
	if (user?.approval_status === "rejected" || user?.is_active === false) {
		return children;
	}

	// Unknown status - redirect to dashboard for safety (let ProtectedRoute handle it)
	return <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;
