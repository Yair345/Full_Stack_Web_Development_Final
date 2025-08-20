import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../components/ui/table";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
	UserCheck,
	UserX,
	Clock,
	RefreshCw,
	AlertCircle,
	CheckCircle,
	XCircle,
	FileImage,
	Eye,
} from "lucide-react";
import { branchAPI } from "../../services/api";

const PendingUsersTab = ({ branchId }) => {
	const [pendingUsers, setPendingUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [processingUserId, setProcessingUserId] = useState(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [showIdPictureDialog, setShowIdPictureDialog] = useState(false);
	const [idPictureUser, setIdPictureUser] = useState(null);
	const [imageUrls, setImageUrls] = useState({});

	useEffect(() => {
		fetchPendingUsers();
	}, [branchId]);

	// Cleanup blob URLs when component unmounts
	useEffect(() => {
		return () => {
			// Revoke all blob URLs to prevent memory leaks
			Object.values(imageUrls).forEach((url) => {
				if (url && url.startsWith("blob:")) {
					URL.revokeObjectURL(url);
				}
			});
		};
	}, [imageUrls]);

	const fetchPendingUsers = async () => {
		try {
			setIsLoading(true);
			setError("");

			const response = await branchAPI.getPendingUsers(branchId);
			setPendingUsers(response.data.pendingUsers || []);
		} catch (err) {
			setError("Failed to fetch pending users");
			console.error("Error fetching pending users:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleApproveUser = async (userId) => {
		try {
			setProcessingUserId(userId);
			setError("");
			setSuccess("");

			await branchAPI.approveUser(branchId, userId);

			setSuccess("User approved successfully!");
			await fetchPendingUsers(); // Refresh the list

			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to approve user");
			console.error("Error approving user:", err);
		} finally {
			setProcessingUserId(null);
		}
	};

	const handleRejectUser = async () => {
		if (!selectedUser) return;

		try {
			setProcessingUserId(selectedUser.id);
			setError("");
			setSuccess("");

			await branchAPI.rejectUser(
				branchId,
				selectedUser.id,
				rejectionReason
			);

			setSuccess("User rejected successfully");
			await fetchPendingUsers(); // Refresh the list

			// Close dialog and reset state
			setShowRejectDialog(false);
			setSelectedUser(null);
			setRejectionReason("");

			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to reject user");
			console.error("Error rejecting user:", err);
		} finally {
			setProcessingUserId(null);
		}
	};

	const openRejectDialog = (user) => {
		setSelectedUser(user);
		setRejectionReason("");
		setShowRejectDialog(true);
	};

	const openIdPictureDialog = (user) => {
		setIdPictureUser(user);
		setShowIdPictureDialog(true);
	};

	const fetchImageWithAuth = async (filename) => {
		try {
			const token = sessionStorage.getItem("token");
			const response = await fetch(
				`${
					import.meta.env.VITE_API_BASE_URL ||
					"http://localhost:5001/api/v1"
				}/uploads/id-pictures/${filename}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to load image");
			}

			const blob = await response.blob();
			return URL.createObjectURL(blob);
		} catch (error) {
			console.error("Error fetching image:", error);
			return null;
		}
	};

	const getIdPictureUrl = (user) => {
		if (!user.id_picture_path) return null;

		// Extract filename from path
		const filename = user.id_picture_path.split("/").pop();

		// If we already have a blob URL for this image, return it
		if (imageUrls[filename]) {
			return imageUrls[filename];
		}

		// Fetch the image with authentication
		fetchImageWithAuth(filename).then((url) => {
			if (url) {
				setImageUrls((prev) => ({ ...prev, [filename]: url }));
			}
		});

		return null; // Return null initially while loading
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
					<span className="ml-2 text-gray-600">
						Loading pending users...
					</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserCheck className="h-5 w-5" />
						Pending User Approvals
					</CardTitle>
					<CardDescription>
						Review and approve new users who want to join your
						branch
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert className="mb-4">
							<CheckCircle className="h-4 w-4" />
							<AlertDescription className="text-green-700">
								{success}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex justify-between items-center mb-4">
						<div className="flex items-center gap-2">
							<Badge variant="secondary">
								{pendingUsers.length} Pending User
								{pendingUsers.length !== 1 ? "s" : ""}
							</Badge>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={fetchPendingUsers}
							disabled={isLoading}
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh
						</Button>
					</div>

					{pendingUsers.length === 0 ? (
						<div className="text-center py-8">
							<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No Pending Users
							</h3>
							<p className="text-gray-600">
								All users have been processed. Check back later
								for new registrations.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Phone</TableHead>
										<TableHead>Registration Date</TableHead>
										<TableHead>ID Picture</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{pendingUsers.map((user) => (
										<TableRow key={user.id}>
											<TableCell className="font-medium">
												{user.first_name}{" "}
												{user.last_name}
											</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												{user.phone || "N/A"}
											</TableCell>
											<TableCell>
												{formatDate(user.created_at)}
											</TableCell>
											<TableCell>
												{user.id_picture_path ? (
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															openIdPictureDialog(
																user
															)
														}
														className="flex items-center gap-1"
													>
														<Eye className="h-3 w-3" />
														View ID
													</Button>
												) : (
													<Badge
														variant="secondary"
														className="text-xs"
													>
														<FileImage className="h-3 w-3 mr-1" />
														Not uploaded
													</Badge>
												)}
											</TableCell>
											<TableCell>
												<Badge
													variant="secondary"
													className="flex items-center gap-1 w-fit"
												>
													<Clock className="h-3 w-3" />
													Pending
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														size="sm"
														onClick={() =>
															handleApproveUser(
																user.id
															)
														}
														disabled={
															processingUserId ===
															user.id
														}
														className="bg-green-600 hover:bg-green-700"
													>
														{processingUserId ===
														user.id ? (
															<RefreshCw className="h-4 w-4 animate-spin" />
														) : (
															<>
																<CheckCircle className="h-4 w-4 mr-1" />
																Approve
															</>
														)}
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() =>
															openRejectDialog(
																user
															)
														}
														disabled={
															processingUserId ===
															user.id
														}
													>
														<XCircle className="h-4 w-4 mr-1" />
														Reject
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Rejection Dialog */}
			<Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject User Application</DialogTitle>
						<DialogDescription>
							Are you sure you want to reject{" "}
							{selectedUser?.first_name} {selectedUser?.last_name}
							's application? Please provide a reason for
							rejection.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="reason">Reason for Rejection</Label>
							<Textarea
								id="reason"
								placeholder="Please explain why this application is being rejected..."
								value={rejectionReason}
								onChange={(e) =>
									setRejectionReason(e.target.value)
								}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowRejectDialog(false);
								setSelectedUser(null);
								setRejectionReason("");
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleRejectUser}
							disabled={
								processingUserId === selectedUser?.id ||
								!rejectionReason.trim()
							}
						>
							{processingUserId === selectedUser?.id ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									Rejecting...
								</>
							) : (
								"Reject User"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ID Picture Dialog */}
			<Dialog
				open={showIdPictureDialog}
				onOpenChange={setShowIdPictureDialog}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>ID Picture</DialogTitle>
						<DialogDescription>
							{idPictureUser?.first_name}{" "}
							{idPictureUser?.last_name}'s uploaded ID document
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{idPictureUser?.id_picture_path ? (
							<div className="flex justify-center">
								{getIdPictureUrl(idPictureUser) ? (
									<img
										src={getIdPictureUrl(idPictureUser)}
										alt={`${idPictureUser.first_name} ${idPictureUser.last_name}'s ID`}
										className="max-w-full h-auto rounded-lg border"
										style={{ maxHeight: "500px" }}
										onError={(e) => {
											e.target.src =
												"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==";
										}}
									/>
								) : (
									<div className="flex flex-col items-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
										<p className="text-gray-600">
											Loading image...
										</p>
									</div>
								)}
							</div>
						) : (
							<div className="text-center py-8">
								<FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600">
									No ID picture available for this user
								</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowIdPictureDialog(false);
								setIdPictureUser(null);
							}}
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default PendingUsersTab;
