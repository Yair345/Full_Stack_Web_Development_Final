const Profile = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Profile</h1>
				<p className="text-gray-600">
					Manage your personal information and settings
				</p>
			</div>

			<div className="card">
				<div className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						User Profile
					</h3>
					<p className="text-gray-500 mb-4">
						This feature is coming soon
					</p>
					<div className="space-y-2">
						<p className="text-sm text-gray-400">
							• Update personal information
						</p>
						<p className="text-sm text-gray-400">
							• Change password
						</p>
						<p className="text-sm text-gray-400">
							• Security settings
						</p>
						<p className="text-sm text-gray-400">
							• Notification preferences
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
