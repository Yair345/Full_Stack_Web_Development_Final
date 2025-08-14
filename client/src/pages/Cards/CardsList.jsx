import CardItem from "./CardItem";

const CardsList = ({
	cards,
	loading,
	error,
	onToggleVisibility,
	onToggleBlock,
	onViewDetails,
}) => {
	if (loading) {
		return (
			<div className="col-12">
				<div className="d-flex justify-content-center py-5">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="col-12">
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			</div>
		);
	}

	if (!cards.length) {
		return (
			<div className="col-12">
				<div className="text-center py-5">
					<div className="text-muted">
						<div className="mb-3">
							<i
								className="bi bi-credit-card"
								style={{ fontSize: "3rem" }}
							></i>
						</div>
						<h5>No Cards Found</h5>
						<p>
							You don't have any cards yet. Request your first
							card to get started.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{cards.map((card) => (
				<CardItem
					key={card.id}
					card={card}
					onToggleVisibility={onToggleVisibility}
					onToggleBlock={onToggleBlock}
					onViewDetails={onViewDetails}
				/>
			))}
		</>
	);
};

export default CardsList;
