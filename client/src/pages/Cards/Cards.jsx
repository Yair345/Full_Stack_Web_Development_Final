import { useState, useEffect } from "react";
import CardsHeader from "./CardsHeader";
import CardsList from "./CardsList";
import CardsSummary from "./CardsSummary";
import PaymentCalculator from "./PaymentCalculator";
import RequestCardModal from "./RequestCardModal";
import CardSettingsModal from "./CardSettingsModal";
import { useCards, useToggleCardBlock } from "../../hooks/api/apiHooks";

const Cards = () => {
	const [showRequestModal, setShowRequestModal] = useState(false);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [selectedCard, setSelectedCard] = useState(null);
	const [cards, setCards] = useState([]);

	const { data: cardsData, loading, error, refetch } = useCards();

	const { mutate: toggleCardBlock, loading: togglingBlock } =
		useToggleCardBlock();

	useEffect(() => {
		if (cardsData?.success && cardsData?.data) {
			// Transform server data to include client-side properties
			const transformedCards = cardsData.data.map((card) => {
				const transformed = {
					...card,
					showFullNumber: false,
					// Map server fields to expected client fields
					fullNumber: card.full_card_number, // Use the full number from server
					cardNumber: card.card_number, // This is the masked version from server
					holderName: card.card_name,
					expiryDate: new Date(card.expiry_date).toLocaleDateString(
						"en-US",
						{
							month: "2-digit",
							year: "2-digit",
						}
					),
					cardType:
						card.card_type.charAt(0).toUpperCase() +
						card.card_type.slice(1),
					accountType:
						card.account?.account_type?.charAt(0).toUpperCase() +
						card.account?.account_type?.slice(1),
					balance: card.account?.balance || 0,
					availableBalance: card.account?.balance || 0,
					// Add some visual properties
					color:
						card.card_type === "credit"
							? "bg-gradient-primary"
							: "bg-gradient-secondary",
				};
				return transformed;
			});
			setCards(transformedCards);
		} else if (cardsData && !cardsData.success) {
			// Handle API error response
			console.error("Cards API error:", cardsData);
			setCards([]);
		} else if (cardsData?.data && Array.isArray(cardsData.data)) {
			// Handle direct data array (fallback)
			const transformedCards = cardsData.data.map((card) => ({
				...card,
				showFullNumber: false,
				fullNumber: card.full_card_number,
				cardNumber: card.card_number, // Masked version
				holderName: card.card_name,
				expiryDate: new Date(card.expiry_date).toLocaleDateString(
					"en-US",
					{
						month: "2-digit",
						year: "2-digit",
					}
				),
				cardType:
					card.card_type.charAt(0).toUpperCase() +
					card.card_type.slice(1),
				accountType:
					card.account?.account_type?.charAt(0).toUpperCase() +
					card.account?.account_type?.slice(1),
				balance: card.account?.balance || 0,
				availableBalance: card.account?.balance || 0,
				color:
					card.card_type === "credit"
						? "bg-gradient-primary"
						: "bg-gradient-secondary",
			}));
			setCards(transformedCards);
		}
	}, [cardsData]);

	const handleRequestCard = () => {
		setShowRequestModal(true);
	};

	const handleCardCreated = (newCard) => {
		// Refresh the cards list
		refetch();
	};

	const handleCardUpdated = (updatedCard) => {
		// Refresh the cards list to get latest data
		refetch();
	};

	const handleToggleVisibility = (cardId) => {
		setCards((prevCards) =>
			prevCards.map((card) => {
				if (card.id === cardId) {
					const newShowFullNumber = !card.showFullNumber;
					return { ...card, showFullNumber: newShowFullNumber };
				}
				return card;
			})
		);
	};

	const handleToggleBlock = (cardId) => {
		toggleCardBlock(cardId, {
			onSuccess: (response) => {
				if (response.success) {
					// Refetch the cards data to get the updated status
					refetch();
				}
			},
			onError: (error) => {
				console.error("Error toggling card block:", error);
				alert("Failed to update card status. Please try again.");
			},
		});
	};

	const handleViewDetails = (cardId) => {
		const card = cards.find((c) => c.id === cardId);
		if (card) {
			setSelectedCard(card);
			setShowSettingsModal(true);
		}
	};

	// Transform error message if needed
	const displayError = error?.message || error || null;

	return (
		<div className="row g-4">
			<CardsHeader onRequestCard={handleRequestCard} />

			<CardsList
				cards={cards}
				loading={loading}
				error={displayError}
				onToggleVisibility={handleToggleVisibility}
				onToggleBlock={handleToggleBlock}
				onViewDetails={handleViewDetails}
				blockingCard={togglingBlock}
			/>

			<CardsSummary cards={cards} />
			<PaymentCalculator />

			<RequestCardModal
				show={showRequestModal}
				onHide={() => setShowRequestModal(false)}
				onCardCreated={handleCardCreated}
			/>

			<CardSettingsModal
				show={showSettingsModal}
				onHide={() => {
					setShowSettingsModal(false);
					setSelectedCard(null);
				}}
				card={selectedCard}
				onCardUpdated={handleCardUpdated}
			/>
		</div>
	);
};

export default Cards;
