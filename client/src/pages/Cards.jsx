const Cards = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Cards</h1>
				<p className="text-gray-600">
					Manage your debit and credit cards
				</p>
			</div>

			<div className="card">
				<div className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Card Management
					</h3>
					<p className="text-gray-500 mb-4">
						This feature is coming soon
					</p>
					<div className="space-y-2">
						<p className="text-sm text-gray-400">
							• View card details
						</p>
						<p className="text-sm text-gray-400">
							• Block/unblock cards
						</p>
						<p className="text-sm text-gray-400">
							• Set spending limits
						</p>
						<p className="text-sm text-gray-400">
							• Request new cards
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Cards;
