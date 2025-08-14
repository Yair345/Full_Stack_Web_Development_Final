import { useState, useEffect } from "react";
import CardsHeader from "./CardsHeader";
import CardsList from "./CardsList";
import CardsSummary from "./CardsSummary";
import PaymentCalculator from "./PaymentCalculator";
import { mockCards } from "./cardUtils";

const Cards = () => {
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadCards = async () => {
			try {
				setLoading(true);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setCards(
					mockCards.map((card) => ({
						...card,
						showFullNumber: false,
					}))
				);
				setError(null);
			} catch (err) {
				setError("Failed to load cards. Please try again.");
				console.error("Error loading cards:", err);
			} finally {
				setLoading(false);
			}
		};

		loadCards();
	}, []);

	const handleRequestCard = () => {
		console.log("Requesting new card...");
		alert("New card request feature will be implemented soon!");
	};

	const handleCardSettings = () => {
		console.log("Opening card settings...");
		alert("Card settings feature will be implemented soon!");
	};

	const handleToggleVisibility = (cardId) => {
		setCards((prevCards) =>
			prevCards.map((card) =>
				card.id === cardId
					? { ...card, showFullNumber: !card.showFullNumber }
					: card
			)
		);
	};

	const handleToggleBlock = (cardId) => {
		setCards((prevCards) =>
			prevCards.map((card) =>
				card.id === cardId
					? {
							...card,
							status:
								card.status === "blocked"
									? "active"
									: "blocked",
					  }
					: card
			)
		);
		console.log("Card block status toggled for card:", cardId);
	};

	const handleViewDetails = (cardId) => {
		console.log("Viewing details for card:", cardId);
		alert("Card details feature will be implemented soon!");
	};

	return (
		<div className="row g-4">
			<CardsHeader
				onRequestCard={handleRequestCard}
				onCardSettings={handleCardSettings}
			/>

			<CardsList
				cards={cards}
				loading={loading}
				error={error}
				onToggleVisibility={handleToggleVisibility}
				onToggleBlock={handleToggleBlock}
				onViewDetails={handleViewDetails}
			/>

			<CardsSummary cards={cards} />
			<PaymentCalculator />
		</div>
	);
};

export default Cards;
