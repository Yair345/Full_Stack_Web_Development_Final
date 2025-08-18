import {
	Eye,
	EyeOff,
	Lock,
	Unlock,
	MoreVertical,
	CreditCard,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const CardItem = ({
	card,
	onToggleVisibility,
	onToggleBlock,
	onViewDetails,
}) => {
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount || 0);
	};

	const getStatusBadge = (status) => {
		const statusMap = {
			active: { class: "bg-success", text: "Active" },
			blocked: { class: "bg-danger", text: "Blocked" },
			expired: { class: "bg-secondary", text: "Expired" },
			cancelled: { class: "bg-dark", text: "Cancelled" },
		};
		const statusInfo = statusMap[status] || {
			class: "bg-secondary",
			text: "Unknown",
		};
		return (
			<span className={`badge ${statusInfo.class}`}>
				{statusInfo.text}
			</span>
		);
	};

	const getCardColor = (cardType, status) => {
		if (
			status === "blocked" ||
			status === "cancelled" ||
			status === "expired"
		) {
			return "bg-secondary";
		}
		return cardType === "credit" ? "bg-primary" : "bg-info";
	};

	const formatCardNumber = (cardNumber, fullNumber, showFull) => {
		if (!cardNumber && !fullNumber) {
			return "•••• •••• •••• ••••";
		}

		if (showFull && fullNumber) {
			// Format full number with spaces
			const formatted = fullNumber.replace(/(\d{4})/g, "$1 ").trim();
			return formatted;
		} else {
			// Show masked version (either the pre-masked cardNumber or generate mask from fullNumber)
			if (cardNumber && cardNumber.includes("•")) {
				return cardNumber;
			} else if (fullNumber) {
				const masked = `•••• •••• •••• ${fullNumber.slice(-4)}`;
				return masked;
			}
			return "•••• •••• •••• ••••";
		}
	};

	return (
		<div className="col-lg-4 col-md-6">
			<Card className="card-item">
				{/* Card Visual */}
				<div
					className={`${getCardColor(
						card.card_type,
						card.status
					)} text-white rounded p-4 mb-3`}
					style={{ minHeight: "200px" }}
				>
					<div className="d-flex justify-content-between align-items-start mb-4">
						<div className="h5 fw-bold mb-0">{card.cardType}</div>
						<div className="dropdown">
							<button
								className="btn btn-link text-white p-0"
								data-bs-toggle="dropdown"
								aria-expanded="false"
							>
								<MoreVertical size={20} />
							</button>
							<ul className="dropdown-menu">
								<li>
									<button
										className="dropdown-item"
										onClick={() => onViewDetails(card.id)}
									>
										<CreditCard
											size={14}
											className="me-2"
										/>
										Card Settings
									</button>
								</li>
								<li>
									<button
										className="dropdown-item"
										onClick={() =>
											onToggleVisibility(card.id)
										}
									>
										{card.showFullNumber ? (
											<EyeOff
												size={14}
												className="me-2"
											/>
										) : (
											<Eye size={14} className="me-2" />
										)}
										{card.showFullNumber ? "Hide" : "Show"}{" "}
										Number
									</button>
								</li>
								{card.status !== "cancelled" &&
									card.status !== "expired" && (
										<li>
											<button
												className="dropdown-item"
												onClick={() =>
													onToggleBlock(card.id)
												}
											>
												{card.status === "blocked" ? (
													<Unlock
														size={14}
														className="me-2"
													/>
												) : (
													<Lock
														size={14}
														className="me-2"
													/>
												)}
												{card.status === "blocked"
													? "Unblock"
													: "Block"}{" "}
												Card
											</button>
										</li>
									)}
							</ul>
						</div>
					</div>

					<div className="mb-4">
						<div className="h4 fw-bold mb-0 font-monospace">
							{formatCardNumber(
								card.cardNumber,
								card.fullNumber,
								card.showFullNumber
							)}
						</div>
					</div>

					<div className="row">
						<div className="col-8">
							<div className="small opacity-75 mb-1">
								CARD HOLDER
							</div>
							<div className="fw-medium">
								{card.holderName || card.card_name}
							</div>
						</div>
						<div className="col-4">
							<div className="small opacity-75 mb-1">EXPIRES</div>
							<div className="fw-medium">{card.expiryDate}</div>
						</div>
					</div>
				</div>

				{/* Card Info */}
				<div className="d-flex justify-content-between align-items-center mb-3">
					<div>
						<span className="text-muted small">Status</span>
						<div>{getStatusBadge(card.status)}</div>
					</div>
					<div className="text-end">
						<span className="text-muted small">Account Type</span>
						<div className="fw-medium">{card.accountType}</div>
					</div>
				</div>

				{/* Limits Info */}
				<div className="row g-2 mb-3">
					<div className="col-6">
						<div className="text-muted small">Daily Limit</div>
						<div className="fw-bold">
							{formatCurrency(card.daily_limit)}
						</div>
					</div>
					<div className="col-6">
						<div className="text-muted small">Monthly Limit</div>
						<div className="fw-bold">
							{formatCurrency(card.monthly_limit)}
						</div>
					</div>
				</div>

				{/* Account Balance Info */}
				<div className="mb-3">
					<div className="text-muted small">Account Balance</div>
					<div className="h5 fw-bold text-success mb-0">
						{formatCurrency(card.balance)}
					</div>
				</div>

				{/* Features */}
				<div className="mb-3">
					<div className="row g-2">
						<div className="col-4">
							<div className="text-center">
								<div
									className={`text-${
										card.contactless_enabled
											? "success"
											: "muted"
									} small`}
								>
									<i
										className={`bi bi-wifi ${
											card.contactless_enabled
												? ""
												: "opacity-50"
										}`}
									></i>
								</div>
								<div className="x-small text-muted">
									Contactless
								</div>
							</div>
						</div>
						<div className="col-4">
							<div className="text-center">
								<div
									className={`text-${
										card.online_transactions_enabled
											? "success"
											: "muted"
									} small`}
								>
									<i
										className={`bi bi-globe ${
											card.online_transactions_enabled
												? ""
												: "opacity-50"
										}`}
									></i>
								</div>
								<div className="x-small text-muted">Online</div>
							</div>
						</div>
						<div className="col-4">
							<div className="text-center">
								<div
									className={`text-${
										card.international_transactions_enabled
											? "success"
											: "muted"
									} small`}
								>
									<i
										className={`bi bi-airplane ${
											card.international_transactions_enabled
												? ""
												: "opacity-50"
										}`}
									></i>
								</div>
								<div className="x-small text-muted">
									International
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="d-grid gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onViewDetails(card.id)}
					>
						Card Settings
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default CardItem;
