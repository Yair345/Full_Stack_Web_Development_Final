import React from "react";
import { Building } from "lucide-react";

const WaitingHeader = () => {
	return (
		<div className="text-center">
			<div className="flex justify-center items-center mb-4">
				<div className="bg-blue-100 p-3 rounded-full">
					<Building className="h-8 w-8 text-blue-600" />
				</div>
			</div>
			<h1 className="text-4xl font-bold text-gray-900 mb-2">
				Account Under Review
			</h1>
			<p className="text-lg text-gray-600">
				Your application is being processed by our branch team
			</p>
		</div>
	);
};

export default WaitingHeader;
