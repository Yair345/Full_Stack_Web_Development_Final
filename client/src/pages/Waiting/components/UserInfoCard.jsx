import React from "react";
import { User, Phone, Mail, MapPin } from "lucide-react";

const UserInfoCard = ({ user }) => {
	if (!user) return null;

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
				<User className="h-5 w-5 mr-2" />
				Your Information
			</h2>
			<div className="space-y-3">
				<div className="flex items-center">
					<span className="font-medium text-gray-700 w-24">
						Name:
					</span>
					<span className="text-gray-900">
						{user.firstName} {user.lastName}
					</span>
				</div>
				<div className="flex items-center">
					<Mail className="h-4 w-4 text-gray-400 mr-2 w-6" />
					<span className="font-medium text-gray-700 w-24">
						Email:
					</span>
					<span className="text-gray-900">{user.email}</span>
				</div>
				<div className="flex items-center">
					<Phone className="h-4 w-4 text-gray-400 mr-2 w-6" />
					<span className="font-medium text-gray-700 w-24">
						Phone:
					</span>
					<span className="text-gray-900">{user.phone}</span>
				</div>
				<div className="flex items-center">
					<MapPin className="h-4 w-4 text-gray-400 mr-2 w-6" />
					<span className="font-medium text-gray-700 w-24">
						Address:
					</span>
					<span className="text-gray-900">{user.address}</span>
				</div>
			</div>
		</div>
	);
};

export default UserInfoCard;
