import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, requireApproval = true }) => {
	const { isAuthenticated, user } = useAuth();
	const location = useLocation();

	// Not authenticated - redirect to login
	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Admin and managers can access everything regardless of approval status
	if (user?.role === "admin" || user?.role === "manager") {
		return children;
	}

	// If approval is required and user is not approved, redirect based on status
	if (requireApproval && user?.approval_status !== "approved") {
		if (user?.approval_status === "pending") {
			return <Navigate to="/waiting" replace />;
		}

		if (user?.approval_status === "rejected") {
			// Could redirect to a rejection page or back to registration
			return <Navigate to="/waiting" replace />;
		}

		// Unknown status - redirect to waiting
		return <Navigate to="/waiting" replace />;
	}

	// User is authenticated and approved (or approval not required)
	return children;
};

// Route component for waiting page - only allows pending users
export const WaitingRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuth();
	const location = useLocation();

	// Not authenticated - redirect to login
	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Admin and managers should go to dashboard
	if (user?.role === "admin" || user?.role === "manager") {
		return <Navigate to="/dashboard" replace />;
	}

	// Approved users should go to dashboard
	if (user?.approval_status === "approved") {
		return <Navigate to="/dashboard" replace />;
	}

	// Only pending or rejected users can access waiting page
	if (
		user?.approval_status === "pending" ||
		user?.approval_status === "rejected"
	) {
		return children;
	}

	// Unknown status - allow access to waiting page
	return children;
};

export default ProtectedRoute;
