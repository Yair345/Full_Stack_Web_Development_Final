const BranchManagement = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">
					Branch Management
				</h1>
				<p className="text-gray-600">
					Manage branch operations and customer accounts
				</p>
			</div>

			<div className="card">
				<div className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Branch Features
					</h3>
					<p className="text-gray-500 mb-4">
						This feature is coming soon
					</p>
					<div className="space-y-2">
						<p className="text-sm text-gray-400">
							• View branch customers
						</p>
						<p className="text-sm text-gray-400">
							• Approve loan applications
						</p>
						<p className="text-sm text-gray-400">
							• Generate branch reports
						</p>
						<p className="text-sm text-gray-400">
							• Monitor transactions
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BranchManagement;
