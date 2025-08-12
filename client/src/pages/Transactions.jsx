const Transactions = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">
					Transactions
				</h1>
				<p className="text-gray-600">
					View your transaction history and manage payments
				</p>
			</div>

			<div className="card">
				<div className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Transaction History
					</h3>
					<p className="text-gray-500 mb-4">
						This feature is coming soon
					</p>
					<div className="space-y-2">
						<p className="text-sm text-gray-400">
							• View all transactions
						</p>
						<p className="text-sm text-gray-400">
							• Filter by date and type
						</p>
						<p className="text-sm text-gray-400">
							• Export statements
						</p>
						<p className="text-sm text-gray-400">
							• Search transactions
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Transactions;
