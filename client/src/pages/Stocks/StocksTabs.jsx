const StocksTabs = ({ activeTab, onTabChange }) => {
	const tabs = [
		{ id: "market", label: "Market", icon: "📊" },
		{ id: "portfolio", label: "My Portfolio", icon: "💼" },
		{ id: "watchlist", label: "Watchlist", icon: "👁️" },
	];

	return (
		<div className="col-12">
			<ul className="nav nav-tabs" role="tablist">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<li
							key={tab.id}
							className="nav-item"
							role="presentation"
						>
							<button
								className={`nav-link ${
									isActive ? "active" : ""
								}`}
								onClick={() => onTabChange(tab.id)}
								type="button"
								role="tab"
							>
								<span className="me-2">{tab.icon}</span>
								{tab.label}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default StocksTabs;
