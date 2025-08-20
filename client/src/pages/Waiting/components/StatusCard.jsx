import React from "react";
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const StatusCard = ({ user, createdAt }) => {
	const getStatusInfo = () => {
		// Check approval_status first, then fall back to isBlocked for backward compatibility
		const approvalStatus = user?.approval_status;
		const isBlocked = user?.isBlocked;

		if (approvalStatus === "rejected") {
			return {
				icon: XCircle,
				title: "Application Rejected",
				message: "Your application has been rejected",
				bgColor: "bg-red-50",
				iconColor: "text-red-600",
				borderColor: "border-red-200",
			};
		}

		if (approvalStatus === "pending" || isBlocked) {
			return {
				icon: AlertCircle,
				title: "Account Pending",
				message: "We're reviewing your application",
				bgColor: "bg-yellow-50",
				iconColor: "text-yellow-600",
				borderColor: "border-yellow-200",
			};
		}

		// Approved or active
		return {
			icon: CheckCircle,
			title: "Account Active",
			message: "Your account has been approved",
			bgColor: "bg-green-50",
			iconColor: "text-green-600",
			borderColor: "border-green-200",
		};
	};

	const status = getStatusInfo();
	const StatusIcon = status.icon;

	// Show rejection reason if user is rejected
	const showRejectionReason =
		user?.approval_status === "rejected" && user?.rejection_reason;

	return (
		<div
			className={`${status.bgColor} ${status.borderColor} border rounded-lg p-4 mb-6`}
		>
			<div className="flex items-center">
				<StatusIcon className={`h-5 w-5 ${status.iconColor} mr-3`} />
				<div>
					<h3 className="font-medium text-gray-900">
						{status.title}
					</h3>
					<p className="text-sm text-gray-600 mt-1">
						{status.message}
					</p>
					{showRejectionReason && (
						<div className="mt-3">
							<p className="text-sm font-medium text-gray-900 mb-1">
								Reason for rejection:
							</p>
							<p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
								{user.rejection_reason}
							</p>
						</div>
					)}
					{createdAt && (
						<p className="text-xs text-gray-500 mt-1">
							<Clock className="h-4 w-4 inline mr-1" />
							Submitted on{" "}
							{new Date(createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default StatusCard;
