import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import ImageModal from "./ImageModal";

const UploadedImageDisplay = ({ user }) => {
	const [showImageModal, setShowImageModal] = useState(false);
	const [currentImageUrl, setCurrentImageUrl] = useState("");

	const viewImage = async () => {
		try {
			const token = localStorage.getItem("authToken");
			const response = await fetch(
				`http://localhost:5001/api/uploads/id-picture/${user._id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const blob = await response.blob();
				const imageUrl = URL.createObjectURL(blob);
				setCurrentImageUrl(imageUrl);
				setShowImageModal(true);
			} else {
				console.error("Failed to fetch image");
			}
		} catch (error) {
			console.error("Error fetching image:", error);
		}
	};

	const closeImageModal = () => {
		setShowImageModal(false);
		if (currentImageUrl) {
			URL.revokeObjectURL(currentImageUrl);
			setCurrentImageUrl("");
		}
	};

	if (!user?.idPicture) return null;

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
				<ImageIcon className="h-5 w-5 mr-2" />
				Uploaded ID Picture
			</h2>
			<div className="text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
					<ImageIcon className="h-8 w-8 text-green-600" />
				</div>
				<p className="text-sm text-gray-600 mb-4">
					ID picture has been uploaded successfully
				</p>
				<button
					onClick={viewImage}
					className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
				>
					<ImageIcon className="h-4 w-4 mr-2" />
					View Image
				</button>
			</div>

			<ImageModal
				imageUrl={currentImageUrl}
				isOpen={showImageModal}
				onClose={closeImageModal}
			/>
		</div>
	);
};

export default UploadedImageDisplay;
