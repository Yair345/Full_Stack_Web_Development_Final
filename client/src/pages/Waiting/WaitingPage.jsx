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
import {
	Loader2,
	RefreshCw,
	Clock,
	Building,
	Upload,
	FileImage,
	CheckCircle,
} from "lucide-react";
import { authAPI } from "../../services/api";

const WaitingPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [approvalStatus, setApprovalStatus] = useState(null);
	const [lastChecked, setLastChecked] = useState(new Date());
	const [error, setError] = useState("");
	const [uploadSuccess, setUploadSuccess] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
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

	const handleFileSelect = (event) => {
		const file = event.target.files[0];
		if (file) {
			// Validate file type
			const allowedTypes = ["image/jpeg", "image/jpg"];
			if (!allowedTypes.includes(file.type)) {
				setError("Please select a JPG or JPEG image file");
				event.target.value = "";
				return;
			}

			// Validate file size (5MB max)
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				setError("File size must be less than 5MB");
				event.target.value = "";
				return;
			}

			setError("");
			setSelectedFile(file);
		}
	};

	const handleUploadIdPicture = async () => {
		if (!selectedFile) {
			setError("Please select a file first");
			return;
		}

		setIsUploading(true);
		setError("");
		setUploadSuccess("");

		try {
			const formData = new FormData();
			formData.append("idPicture", selectedFile);

			// Debug: Check if token exists
			const token = sessionStorage.getItem("token");
			console.log("Token exists:", !!token);
			console.log(
				"Token preview:",
				token ? token.substring(0, 20) + "..." : "No token"
			);

			await authAPI.uploadIdPicture(formData);

			setUploadSuccess("ID picture uploaded successfully!");
			setSelectedFile(null);

			// Clear file input
			const fileInput = document.getElementById("id-picture-input");
			if (fileInput) {
				fileInput.value = "";
			}

			// Clear success message after 5 seconds
			setTimeout(() => setUploadSuccess(""), 5000);

			// Refresh approval status to get updated info
			await checkApprovalStatus();
		} catch (err) {
			setError(err.message || "Failed to upload ID picture");
			console.error("Error uploading ID picture:", err);
		} finally {
			setIsUploading(false);
		}
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

				{/* ID Picture Upload Section */}
				{approvalStatus?.approval_status === "pending" && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileImage className="h-5 w-5" />
								Upload ID Picture
							</CardTitle>
							<CardDescription>
								Upload a clear photo of your ID document
								(JPG/JPEG format, max 5MB)
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{uploadSuccess && (
								<Alert>
									<CheckCircle className="h-4 w-4" />
									<AlertDescription className="text-green-700">
										{uploadSuccess}
									</AlertDescription>
								</Alert>
							)}

							<div className="space-y-3">
								<div>
									<label
										htmlFor="id-picture-input"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Select ID Picture
									</label>
									<input
										id="id-picture-input"
										type="file"
										accept="image/jpeg,image/jpg"
										onChange={handleFileSelect}
										className="block w-full text-sm text-gray-500 
											file:mr-4 file:py-2 file:px-4 
											file:rounded-full file:border-0 
											file:text-sm file:font-semibold 
											file:bg-blue-50 file:text-blue-700 
											hover:file:bg-blue-100"
									/>
								</div>

								{selectedFile && (
									<div className="text-sm text-gray-600">
										Selected file: {selectedFile.name} (
										{(
											selectedFile.size /
											1024 /
											1024
										).toFixed(2)}{" "}
										MB)
									</div>
								)}

								<Button
									onClick={handleUploadIdPicture}
									disabled={isUploading || !selectedFile}
									className="w-full"
								>
									{isUploading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Uploading...
										</>
									) : (
										<>
											<Upload className="mr-2 h-4 w-4" />
											Upload ID Picture
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

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
