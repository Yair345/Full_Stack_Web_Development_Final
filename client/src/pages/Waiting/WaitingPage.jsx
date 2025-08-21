import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Import components
import WaitingHeader from "./components/WaitingHeader";
import StatusCard from "./components/StatusCard";
import UserInfoCard from "./components/UserInfoCard";
import FileUploadSection from "./components/FileUploadSection";
import UploadedImageDisplay from "./components/UploadedImageDisplay";
import ActionButtons from "./components/ActionButtons";

const WaitingPage = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [isRefreshing, setIsRefreshing] = useState(false);

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}

		// Check if user is rejected - redirect to rejected page
		if (
			user &&
			(user.approval_status === "rejected" || user.is_active === false)
		) {
			navigate("/rejected");
			return;
		}

		// Check if user is approved - redirect to dashboard
		if (
			user &&
			(user.approval_status === "approved" ||
				(!user.isBlocked && !user.approval_status))
		) {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			// Simulate API call to check user status
			await new Promise((resolve) => setTimeout(resolve, 2000));
			window.location.reload();
		} catch (error) {
			console.error("Error refreshing status:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleFileUploaded = (file) => {
		// Handle successful file upload if needed
	};

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header */}
				<WaitingHeader />

				{/* Status Card */}
				<StatusCard user={user} createdAt={user?.createdAt} />

				<div className="grid md:grid-cols-2 gap-8">
					{/* User Information */}
					<UserInfoCard user={user} />

					{/* File Upload or Image Display */}
					{user?.idPicture ? (
						<UploadedImageDisplay user={user} />
					) : (
						<FileUploadSection
							onFileUploaded={handleFileUploaded}
						/>
					)}
				</div>

				{/* Action Buttons */}
				<ActionButtons
					onLogout={handleLogout}
					onRefresh={handleRefresh}
					isRefreshing={isRefreshing}
				/>

				{/* Information Steps */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
						What happens next?
					</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<div className="text-center">
							<div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-lg font-bold text-blue-600">
									1
								</span>
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								Document Review
							</h3>
							<p className="text-sm text-gray-600">
								Our team reviews your submitted documents and
								information.
							</p>
						</div>
						<div className="text-center">
							<div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-lg font-bold text-blue-600">
									2
								</span>
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								Verification
							</h3>
							<p className="text-sm text-gray-600">
								We verify your identity and check all provided
								details.
							</p>
						</div>
						<div className="text-center">
							<div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-lg font-bold text-blue-600">
									3
								</span>
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								Account Activation
							</h3>
							<p className="text-sm text-gray-600">
								Once approved, your account will be activated
								automatically.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WaitingPage;
