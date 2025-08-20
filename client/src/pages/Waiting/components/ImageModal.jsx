import React, { useState } from "react";
import { X } from "lucide-react";

const ImageModal = ({ imageUrl, isOpen, onClose }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	if (!isOpen) return null;

	const handleImageLoad = () => {
		setLoading(false);
	};

	const handleImageError = () => {
		setLoading(false);
		setError(true);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Escape") {
			onClose();
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
			onClick={onClose}
			onKeyDown={handleKeyDown}
			tabIndex="0"
		>
			<div
				className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
					aria-label="Close modal"
				>
					<X className="h-5 w-5 text-gray-600" />
				</button>

				{loading && (
					<div className="flex items-center justify-center p-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				)}

				{error ? (
					<div className="flex items-center justify-center p-8">
						<p className="text-red-600">Failed to load image</p>
					</div>
				) : (
					<img
						src={imageUrl}
						alt="ID Document"
						className="max-w-full max-h-[90vh] object-contain"
						onLoad={handleImageLoad}
						onError={handleImageError}
						style={{ display: loading ? "none" : "block" }}
					/>
				)}
			</div>
		</div>
	);
};

export default ImageModal;
