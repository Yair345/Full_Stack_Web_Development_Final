import React, { useState } from "react";
import { Upload, X, Eye, FileText } from "lucide-react";

const FileUploadSection = ({ onFileUploaded }) => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadError, setUploadError] = useState("");

	const handleFileUpload = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			setUploadError("Please upload only JPEG, PNG, or GIF images");
			return;
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			setUploadError("File size must be less than 5MB");
			return;
		}

		setIsUploading(true);
		setUploadError("");
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append("idPicture", file);

			// Create progress simulation
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 100);

			const token = localStorage.getItem("authToken");
			const response = await fetch(
				"http://localhost:5001/api/uploads/id-picture",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				}
			);

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (response.ok) {
				const result = await response.json();
				console.log("Upload successful:", result);

				const newFile = {
					id: Date.now(),
					name: file.name,
					size: file.size,
					type: file.type,
					uploadedAt: new Date(),
					url: URL.createObjectURL(file), // For preview
				};

				setUploadedFiles([...uploadedFiles, newFile]);
				if (onFileUploaded) {
					onFileUploaded(newFile);
				}

				// Clear file input
				event.target.value = "";
			} else {
				const error = await response.json();
				throw new Error(error.message || "Upload failed");
			}
		} catch (error) {
			console.error("Upload error:", error);
			setUploadError(error.message || "Failed to upload file");
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const removeFile = (fileId) => {
		setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId));
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
				<FileText className="h-5 w-5 mr-2" />
				ID Picture Upload
			</h2>

			{/* Upload Area */}
			<div className="mb-6">
				<label
					htmlFor="idPicture"
					className="relative block w-full p-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-colors cursor-pointer"
				>
					<div className="text-center">
						<Upload className="mx-auto h-12 w-12 text-gray-400" />
						<div className="mt-4">
							<p className="text-lg font-medium text-gray-900">
								Upload ID Picture
							</p>
							<p className="text-sm text-gray-500 mt-1">
								JPEG, PNG, or GIF up to 5MB
							</p>
						</div>
					</div>
					<input
						id="idPicture"
						type="file"
						accept="image/*"
						onChange={handleFileUpload}
						disabled={isUploading}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
				</label>
			</div>

			{/* Upload Progress */}
			{isUploading && (
				<div className="mb-4">
					<div className="flex justify-between text-sm text-gray-600 mb-1">
						<span>Uploading...</span>
						<span>{uploadProgress}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full transition-all duration-200"
							style={{ width: `${uploadProgress}%` }}
						></div>
					</div>
				</div>
			)}

			{/* Upload Error */}
			{uploadError && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
					<p className="text-sm text-red-600">{uploadError}</p>
				</div>
			)}

			{/* Uploaded Files */}
			{uploadedFiles.length > 0 && (
				<div>
					<h3 className="text-sm font-medium text-gray-900 mb-3">
						Uploaded Files ({uploadedFiles.length})
					</h3>
					<div className="space-y-2">
						{uploadedFiles.map((file) => (
							<div
								key={file.id}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex items-center space-x-3">
									<div className="flex-shrink-0">
										{file.type.startsWith("image/") ? (
											<img
												src={file.url}
												alt={file.name}
												className="h-10 w-10 rounded object-cover"
											/>
										) : (
											<FileText className="h-10 w-10 text-gray-400" />
										)}
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900">
											{file.name}
										</p>
										<p className="text-xs text-gray-500">
											{formatFileSize(file.size)} •{" "}
											{file.uploadedAt.toLocaleTimeString()}
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									{file.type.startsWith("image/") && (
										<button
											onClick={() =>
												window.open(file.url)
											}
											className="p-1 text-gray-400 hover:text-blue-600"
											title="View image"
										>
											<Eye className="h-4 w-4" />
										</button>
									)}
									<button
										onClick={() => removeFile(file.id)}
										className="p-1 text-gray-400 hover:text-red-600"
										title="Remove file"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default FileUploadSection;
