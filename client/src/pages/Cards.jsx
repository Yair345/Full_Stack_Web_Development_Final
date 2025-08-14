import { useState, useEffect } from "react";
import {
	CreditCard,
	Eye,
	EyeOff,
	Lock,
	Unlock,
	Settings,
	Plus,
	MoreVertical,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const Cards = () => {
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [visibleCards, setVisibleCards] = useState(new Set());

	// Mock data for cards
	const mockCards = [
		{
			id: 1,
			type: "debit",
			number: "4532 1234 5678 9012",
			holder: "John Doe",
			expiryDate: "12/26",
			cvv: "123",
			balance: 2500.75,
			status: "active",
			isDefault: true,
			issuer: "Visa",
			cardName: "Primary Checking",
			dailyLimit: 1000,
			monthlySpent: 1250.5,
		},
		{
			id: 2,
			type: "credit",
			number: "5555 6666 7777 8888",
			holder: "John Doe",
			expiryDate: "09/27",
			cvv: "456",
			balance: -1200.5,
			creditLimit: 5000,
			status: "active",
			isDefault: false,
			issuer: "Mastercard",
			cardName: "Rewards Credit Card",
			availableCredit: 3799.5,
			monthlySpent: 890.25,
		},
		{
			id: 3,
			type: "debit",
			number: "4111 2222 3333 4444",
			holder: "John Doe",
			expiryDate: "03/25",
			cvv: "789",
			balance: 500.0,
			status: "blocked",
			isDefault: false,
			issuer: "Visa",
			cardName: "Savings Account Card",
			dailyLimit: 500,
			monthlySpent: 120.0,
		},
	];

	useEffect(() => {
		const loadCards = async () => {
			try {
				setLoading(true);
				// Simulate network delay
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setCards(mockCards);
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

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatCardNumber = (number, isVisible) => {
		if (isVisible) {
			return number;
		}
		return number.replace(/\d(?=\d{4})/g, "•");
	};

	const toggleCardVisibility = (cardId) => {
		setVisibleCards((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(cardId)) {
				newSet.delete(cardId);
			} else {
				newSet.add(cardId);
			}
			return newSet;
		});
	};

	const getCardBackground = (type, issuer) => {
		if (type === "credit") {
			return "bg-gradient-warning";
		}
		if (issuer === "Mastercard") {
			return "bg-gradient-info";
		}
		return "bg-gradient-primary";
	};

	const handleCardAction = (action, cardId) => {
		console.log(`${action} card:`, cardId);
		// TODO: Implement actual card actions
		alert(`${action} card feature coming soon!`);
	};

	if (loading) {
		return (
			<div className="row g-4">
				<div className="col-12">
					<div className="d-flex justify-content-center py-5">
						<div
							className="spinner-border text-primary"
							role="status"
						>
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="row g-4">
				<div className="col-12">
					<div className="alert alert-danger" role="alert">
						{error}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="row g-4">
			{/* Header */}
			<div className="col-12">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<div>
						<h1 className="h2 fw-bold text-dark mb-1">Cards</h1>
						<p className="text-muted mb-0">
							Manage your debit and credit cards
						</p>
					</div>
					<Button
						variant="primary"
						className="d-flex align-items-center"
						onClick={() => handleCardAction("Request new", null)}
					>
						<Plus size={16} className="me-2" />
						Request Card
					</Button>
				</div>
			</div>

			{/* Cards Grid */}
			<div className="col-12">
				<div className="row g-4">
					{cards.map((card) => (
						<div key={card.id} className="col-lg-6">
							{/* Card Visual */}
							<Card className="mb-3">
								<div
									className={`${getCardBackground(
										card.type,
										card.issuer
									)} rounded p-4 text-white position-relative`}
								>
									<div className="d-flex justify-content-between align-items-start mb-4">
										<div>
											<p className="small opacity-75 mb-1">
												{card.cardName}
											</p>
											<div className="d-flex align-items-center">
												<CreditCard
													size={24}
													className="me-2"
												/>
												<span className="fw-medium">
													{card.issuer}
												</span>
											</div>
										</div>
										<div className="d-flex">
											<button
												className="btn btn-link text-white p-1 me-1"
												onClick={() =>
													toggleCardVisibility(
														card.id
													)
												}
											>
												{visibleCards.has(card.id) ? (
													<EyeOff size={16} />
												) : (
													<Eye size={16} />
												)}
											</button>
											<div className="dropdown">
												<button
													className="btn btn-link text-white p-1"
													data-bs-toggle="dropdown"
												>
													<MoreVertical size={16} />
												</button>
												<ul className="dropdown-menu">
													<li>
														<button
															className="dropdown-item"
															onClick={() =>
																handleCardAction(
																	"Block",
																	card.id
																)
															}
														>
															{card.status ===
															"active"
																? "Block Card"
																: "Unblock Card"}
														</button>
													</li>
													<li>
														<button
															className="dropdown-item"
															onClick={() =>
																handleCardAction(
																	"Settings",
																	card.id
																)
															}
														>
															Card Settings
														</button>
													</li>
													<li>
														<hr className="dropdown-divider" />
													</li>
													<li>
														<button
															className="dropdown-item text-danger"
															onClick={() =>
																handleCardAction(
																	"Report Lost",
																	card.id
																)
															}
														>
															Report Lost/Stolen
														</button>
													</li>
												</ul>
											</div>
										</div>
									</div>

									<div className="mb-4">
										<p className="h5 fw-bold mb-0 font-monospace">
											{formatCardNumber(
												card.number,
												visibleCards.has(card.id)
											)}
										</p>
									</div>

									<div className="d-flex justify-content-between align-items-end">
										<div>
											<p className="small opacity-75 mb-1">
												Card Holder
											</p>
											<p className="fw-medium mb-0">
												{card.holder}
											</p>
										</div>
										<div className="text-end">
											<p className="small opacity-75 mb-1">
												Expires
											</p>
											<p className="fw-medium mb-0">
												{card.expiryDate}
											</p>
										</div>
									</div>

									{card.status === "blocked" && (
										<div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded d-flex align-items-center justify-content-center">
											<div className="text-center">
												<Lock
													size={32}
													className="mb-2"
												/>
												<p className="fw-bold mb-0">
													BLOCKED
												</p>
											</div>
										</div>
									)}
								</div>
							</Card>

							{/* Card Details */}
							<Card>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h6 className="fw-medium mb-0">
										Card Details
									</h6>
									<span
										className={`badge ${
											card.status === "active"
												? "bg-success"
												: "bg-danger"
										}`}
									>
										{card.status.toUpperCase()}
									</span>
								</div>

								<div className="row g-3">
									<div className="col-6">
										<p className="small text-muted mb-1">
											{card.type === "credit"
												? "Available Credit"
												: "Balance"}
										</p>
										<p className="fw-semibold mb-0">
											{card.type === "credit"
												? formatCurrency(
														card.availableCredit
												  )
												: formatCurrency(card.balance)}
										</p>
									</div>
									<div className="col-6">
										<p className="small text-muted mb-1">
											Monthly Spent
										</p>
										<p className="fw-semibold mb-0">
											{formatCurrency(card.monthlySpent)}
										</p>
									</div>
									{card.type === "credit" && (
										<>
											<div className="col-6">
												<p className="small text-muted mb-1">
													Credit Limit
												</p>
												<p className="fw-semibold mb-0">
													{formatCurrency(
														card.creditLimit
													)}
												</p>
											</div>
											<div className="col-6">
												<p className="small text-muted mb-1">
													Current Balance
												</p>
												<p className="fw-semibold mb-0 text-danger">
													{formatCurrency(
														Math.abs(card.balance)
													)}
												</p>
											</div>
										</>
									)}
									{card.type === "debit" && (
										<div className="col-6">
											<p className="small text-muted mb-1">
												Daily Limit
											</p>
											<p className="fw-semibold mb-0">
												{formatCurrency(
													card.dailyLimit
												)}
											</p>
										</div>
									)}
								</div>

								<hr />

								<div className="d-flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											handleCardAction(
												"Settings",
												card.id
											)
										}
									>
										<Settings size={14} className="me-1" />
										Settings
									</Button>
									<Button
										variant={
											card.status === "active"
												? "outline"
												: "primary"
										}
										size="sm"
										onClick={() =>
											handleCardAction(
												card.status === "active"
													? "Block"
													: "Unblock",
												card.id
											)
										}
									>
										{card.status === "active" ? (
											<>
												<Lock
													size={14}
													className="me-1"
												/>
												Block
											</>
										) : (
											<>
												<Unlock
													size={14}
													className="me-1"
												/>
												Unblock
											</>
										)}
									</Button>
								</div>
							</Card>
						</div>
					))}
				</div>
			</div>

			{/* Quick Actions */}
			<div className="col-12">
				<Card>
					<h6 className="fw-medium mb-3">Quick Actions</h6>
					<div className="row g-3">
						<div className="col-md-3">
							<Button
								variant="outline"
								className="w-100"
								onClick={() =>
									handleCardAction("View PIN", null)
								}
							>
								View PIN
							</Button>
						</div>
						<div className="col-md-3">
							<Button
								variant="outline"
								className="w-100"
								onClick={() =>
									handleCardAction("Change PIN", null)
								}
							>
								Change PIN
							</Button>
						</div>
						<div className="col-md-3">
							<Button
								variant="outline"
								className="w-100"
								onClick={() =>
									handleCardAction("Set Limits", null)
								}
							>
								Set Limits
							</Button>
						</div>
						<div className="col-md-3">
							<Button
								variant="outline"
								className="w-100"
								onClick={() =>
									handleCardAction(
										"Transaction History",
										null
									)
								}
							>
								Card Statements
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default Cards;
