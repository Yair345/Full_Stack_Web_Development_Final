import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
	XCircle,
	LogOut,
	Mail,
	Phone,
	AlertTriangle,
	RefreshCw,
	HelpCircle,
	User,
} from "lucide-react";

const RejectedPage = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const handleContactSupport = () => {
		// You can replace this with actual contact method
		window.open(
			"mailto:support@securebank.com?subject=Application Rejection Inquiry",
			"_blank"
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex justify-center items-center mb-6">
						<div className="relative">
							<div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-full shadow-lg">
								<XCircle className="h-16 w-16 text-white" />
							</div>
							<div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-2">
								<AlertTriangle className="h-4 w-4 text-white" />
							</div>
						</div>
					</div>
					<h1 className="text-4xl font-bold text-gray-900 mb-2">
						Application Rejected
					</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Unfortunately, your account application has been
						rejected. Please review the details below and follow the
						next steps to address any issues.
					</p>
				</div>

				{/* Rejection Details */}
				<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
					<div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 mb-8 relative overflow-hidden">
						<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
						<div className="flex flex-col items-center text-center">
							<div className="bg-red-600 p-3 rounded-full mb-4">
								<XCircle className="h-6 w-6 text-white" />
							</div>
							<div className="w-full">
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									Application Status: Rejected
								</h3>
								{user?.rejection_reason && (
									<div className="mt-4">
										<h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-center">
											<AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
											Reason for Rejection:
										</h4>
										<div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm text-center">
											<p className="text-gray-800 text-base leading-relaxed">
												{user.rejection_reason}
											</p>
										</div>
									</div>
								)}
								{user?.approved_at && (
									<div className="mt-4 flex items-center justify-center text-gray-600 bg-gray-50 rounded-lg p-3">
										<RefreshCw className="h-4 w-4 mr-2" />
										<span className="text-sm">
											Reviewed on{" "}
											{new Date(
												user.approved_at
											).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* User Information */}
					<div className="mb-8 text-center">
						<h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center">
							<User className="h-5 w-5 mr-2 text-gray-700" />
							Your Application Details
						</h3>
						<div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
									<div className="flex flex-col items-center">
										<div className="bg-blue-100 p-2 rounded-lg mb-3">
											<User className="h-4 w-4 text-blue-600" />
										</div>
										<div>
											<span className="text-sm font-medium text-gray-500">
												Full Name
											</span>
											<p className="text-gray-900 font-semibold">
												{user?.firstName ||
													user?.first_name}{" "}
												{user?.lastName ||
													user?.last_name}
											</p>
										</div>
									</div>
								</div>

								<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
									<div className="flex flex-col items-center">
										<div className="bg-green-100 p-2 rounded-lg mb-3">
											<Mail className="h-4 w-4 text-green-600" />
										</div>
										<div>
											<span className="text-sm font-medium text-gray-500">
												Email Address
											</span>
											<p className="text-gray-900 font-semibold break-all">
												{user?.email}
											</p>
										</div>
									</div>
								</div>

								{user?.phone && (
									<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 sm:col-span-2 text-center">
										<div className="flex flex-col items-center">
											<div className="bg-purple-100 p-2 rounded-lg mb-3">
												<Phone className="h-4 w-4 text-purple-600" />
											</div>
											<div>
												<span className="text-sm font-medium text-gray-500">
													Phone Number
												</span>
												<p className="text-gray-900 font-semibold">
													{user.phone}
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Next Steps */}
				<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
					<h3 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
						<HelpCircle className="h-6 w-6 mr-2 text-blue-600" />
						What can you do next?
					</h3>
					<div className="space-y-6">
						<div className="flex flex-col items-center text-center group hover:bg-gray-50 rounded-xl p-4 transition-colors">
							<div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
								<span className="text-lg font-bold text-white">
									1
								</span>
							</div>
							<div className="max-w-2xl">
								<h4 className="text-lg font-bold text-gray-900 mb-2">
									Review the rejection reason
								</h4>
								<p className="text-gray-600 leading-relaxed">
									Carefully read the rejection reason provided
									above. Understanding the specific issues
									mentioned will help you address them
									effectively in a future application.
								</p>
							</div>
						</div>

						<div className="flex flex-col items-center text-center group hover:bg-gray-50 rounded-xl p-4 transition-colors">
							<div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
								<span className="text-lg font-bold text-white">
									2
								</span>
							</div>
							<div className="max-w-2xl">
								<h4 className="text-lg font-bold text-gray-900 mb-2">
									Contact customer support
								</h4>
								<p className="text-gray-600 leading-relaxed mb-3">
									If you have questions about the rejection or
									need clarification, our customer support
									team is here to help you understand the
									decision.
								</p>
								<button
									onClick={handleContactSupport}
									className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors text-sm text-white font-medium rounded-lg border-none outline-none"
									style={{ color: "white" }}
								>
									<Mail className="h-4 w-4 mr-2 text-white" />
									<span className="text-white font-medium">
										Contact Support
									</span>
								</button>
							</div>
						</div>

						<div className="flex flex-col items-center text-center group hover:bg-gray-50 rounded-xl p-4 transition-colors">
							<div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
								<span className="text-lg font-bold text-white">
									3
								</span>
							</div>
							<div className="max-w-2xl">
								<h4 className="text-lg font-bold text-gray-900 mb-2">
									Apply again (if eligible)
								</h4>
								<p className="text-gray-600 leading-relaxed">
									After addressing the issues mentioned in the
									rejection reason, you may be eligible to
									submit a new application. Please ensure all
									requirements are met before reapplying.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<button
						onClick={handleContactSupport}
						className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl rounded-xl border-none outline-none"
						style={{ backgroundColor: "#2563eb", color: "white" }}
					>
						<HelpCircle
							className="h-5 w-5 mr-2"
							style={{ color: "white" }}
						/>
						<span
							className="font-semibold"
							style={{ color: "white" }}
						>
							Get Help
						</span>
					</button>
					<button
						onClick={handleLogout}
						className="flex items-center justify-center px-8 py-4 bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl rounded-xl border-none outline-none"
						style={{ backgroundColor: "#4b5563", color: "white" }}
					>
						<LogOut
							className="h-5 w-5 mr-2"
							style={{ color: "white" }}
						/>
						<span
							className="font-semibold"
							style={{ color: "white" }}
						>
							Logout
						</span>
					</button>
				</div>

				{/* Additional Information */}
				<div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
					<div className="text-center">
						<div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<HelpCircle className="h-8 w-8 text-blue-600" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-3">
							Need Additional Help?
						</h3>
						<p className="text-gray-600 max-w-2xl mx-auto mb-6">
							Our support team is available 24/7 to assist you
							with any questions or concerns regarding your
							application. We're committed to helping you through
							this process.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-600">
							<div className="flex items-center">
								<Mail className="h-4 w-4 mr-2" />
								support@securebank.com
							</div>
							<div className="flex items-center">
								<Phone className="h-4 w-4 mr-2" />
								1-800-SECURE-BANK
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RejectedPage;
