import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2, RefreshCw, Clock, Building } from "lucide-react";
import { authAPI } from "../../services/api";

const WaitingPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [approvalStatus, setApprovalStatus] = useState(null);
	const [lastChecked, setLastChecked] = useState(new Date());
	const [error, setError] = useState("");
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	// Check approval status on component mount
	useEffect(() => {
		checkApprovalStatus();
	}, []);

	// Redirect if user is already approved
	useEffect(() => {
		if (user && user.approval_status === "approved") {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	const checkApprovalStatus = async () => {
		setIsLoading(true);
		setError("");

		try {
			const response = await authAPI.getApprovalStatus();
			setApprovalStatus(response.data);
			setLastChecked(new Date());

			// If approved, redirect to dashboard
			if (response.data.approval_status === "approved") {
				setTimeout(() => {
					navigate("/dashboard");
				}, 1500);
			}

			// If rejected, show rejection reason
			if (response.data.approval_status === "rejected") {
				setError(
					response.data.rejection_reason ||
						"Your account has been rejected."
				);
			}
		} catch (err) {
			setError("Failed to check approval status. Please try again.");
			console.error("Error checking approval status:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "pending":
				return "text-yellow-600";
			case "approved":
				return "text-green-600";
			case "rejected":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "pending":
				return <Clock className="h-5 w-5 text-yellow-600" />;
			case "approved":
				return <div className="h-5 w-5 rounded-full bg-green-600" />;
			case "rejected":
				return <div className="h-5 w-5 rounded-full bg-red-600" />;
			default:
				return <div className="h-5 w-5 rounded-full bg-gray-600" />;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full space-y-6">
				<div className="text-center">
					<Building className="mx-auto h-12 w-12 text-blue-600" />
					<h1 className="mt-4 text-3xl font-bold text-gray-900">
						Account Pending
					</h1>
					<p className="mt-2 text-gray-600">
						Waiting for branch manager approval
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							{approvalStatus &&
								getStatusIcon(approvalStatus.approval_status)}
							Approval Status
						</CardTitle>
						<CardDescription>
							Your account is currently under review
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{approvalStatus && (
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-500">
										Status:
									</span>
									<span
										className={`text-sm font-medium capitalize ${getStatusColor(
											approvalStatus.approval_status
										)}`}
									>
										{approvalStatus.approval_status}
									</span>
								</div>

								{approvalStatus.pending_branch_id && (
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-gray-500">
											Branch ID:
										</span>
										<span className="text-sm text-gray-900">
											{approvalStatus.pending_branch_id}
										</span>
									</div>
								)}

								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-500">
										Last Checked:
									</span>
									<span className="text-sm text-gray-900">
										{lastChecked.toLocaleTimeString()}
									</span>
								</div>
							</div>
						)}

						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{approvalStatus?.approval_status === "approved" && (
							<Alert>
								<AlertDescription className="text-green-700">
									Great! Your account has been approved.
									Redirecting to dashboard...
								</AlertDescription>
							</Alert>
						)}

						{approvalStatus?.approval_status === "rejected" && (
							<Alert variant="destructive">
								<AlertDescription>
									Your account has been rejected. Please
									contact the branch for more information.
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>

				<div className="space-y-3">
					<Button
						onClick={checkApprovalStatus}
						disabled={isLoading}
						className="w-full"
						variant="outline"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Checking Status...
							</>
						) : (
							<>
								<RefreshCw className="mr-2 h-4 w-4" />
								Refresh Status
							</>
						)}
					</Button>

					<Button
						onClick={handleLogout}
						variant="secondary"
						className="w-full"
					>
						Logout
					</Button>
				</div>

				<div className="text-center text-sm text-gray-500">
					<p>Your account will be reviewed by the branch manager.</p>
					<p>This process usually takes 1-2 business days.</p>
				</div>
			</div>
		</div>
	);
};

export default WaitingPage;
