import React from "react";
import { LogOut, RefreshCw } from "lucide-react";

const ActionButtons = ({ onLogout, onRefresh, isRefreshing }) => {
	return (
		<div className="flex flex-col sm:flex-row gap-4 justify-center">
			<button
				onClick={onRefresh}
				disabled={isRefreshing}
				className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<RefreshCw
					className={`h-5 w-5 mr-2 ${
						isRefreshing ? "animate-spin" : ""
					}`}
				/>
				{isRefreshing ? "Checking..." : "Check Status"}
			</button>
			<button
				onClick={onLogout}
				className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition-colors"
			>
				<LogOut className="h-5 w-5 mr-2" />
				Logout
			</button>
		</div>
	);
};

export default ActionButtons;
