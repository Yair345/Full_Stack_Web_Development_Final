const AdminPanel = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">
					Admin Panel
				</h1>
				<p className="text-gray-600">
					System administration and user management
				</p>
			</div>

			<div className="card">
				<div className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Admin Features
					</h3>
					<p className="text-gray-500 mb-4">
						This feature is coming soon
					</p>
					<div className="space-y-2">
						<p className="text-sm text-gray-400">
							• User management
						</p>
						<p className="text-sm text-gray-400">
							• System configuration
						</p>
						<p className="text-sm text-gray-400">• Audit logs</p>
						<p className="text-sm text-gray-400">
							• Reports and analytics
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminPanel;
