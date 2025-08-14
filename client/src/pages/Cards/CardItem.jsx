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
import { getCardIcon, getCardStatusColor } from "./cardUtils";

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
		}).format(amount);
	};

	const getStatusBadge = (status) => {
		const statusMap = {
			active: { class: "bg-success", text: "Active" },
			blocked: { class: "bg-danger", text: "Blocked" },
			expired: { class: "bg-secondary", text: "Expired" },
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

	return (
		<div className="col-lg-4 col-md-6">
			<Card>
				{/* Card Visual */}
				<div
					className={`${card.color} text-white rounded p-4 mb-3`}
					style={{ minHeight: "200px" }}
				>
					<div className="d-flex justify-content-between align-items-start mb-4">
						<div className="h5 fw-bold mb-0">{card.cardType}</div>
						<div className="dropdown">
							<button
								className="btn btn-link text-white p-0"
								data-bs-toggle="dropdown"
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
										View Details
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
								<li>
									<button
										className="dropdown-item"
										onClick={() => onToggleBlock(card.id)}
									>
										{card.status === "blocked" ? (
											<Unlock
												size={14}
												className="me-2"
											/>
										) : (
											<Lock size={14} className="me-2" />
										)}
										{card.status === "blocked"
											? "Unblock"
											: "Block"}{" "}
										Card
									</button>
								</li>
							</ul>
						</div>
					</div>

					<div className="mb-4">
						<div className="h4 fw-bold mb-0 font-monospace">
							{card.showFullNumber
								? card.fullNumber
								: card.cardNumber}
						</div>
					</div>

					<div className="row">
						<div className="col-8">
							<div className="small opacity-75 mb-1">
								CARD HOLDER
							</div>
							<div className="fw-medium">{card.holderName}</div>
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
						<span className="text-muted small">Type</span>
						<div className="fw-medium">{card.accountType}</div>
					</div>
				</div>

				{/* Balance Info */}
				{card.accountType === "Credit" ? (
					<div className="row g-2 mb-3">
						<div className="col-6">
							<div className="text-muted small">Balance</div>
							<div className="fw-bold">
								{formatCurrency(card.balance)}
							</div>
						</div>
						<div className="col-6">
							<div className="text-muted small">Available</div>
							<div className="fw-bold text-success">
								{formatCurrency(card.availableCredit)}
							</div>
						</div>
						<div className="col-12">
							<div className="text-muted small">Credit Limit</div>
							<div className="fw-medium">
								{formatCurrency(card.creditLimit)}
							</div>
						</div>
					</div>
				) : (
					<div className="mb-3">
						<div className="text-muted small">
							Available Balance
						</div>
						<div className="h5 fw-bold text-success mb-0">
							{formatCurrency(card.availableBalance)}
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="d-grid gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onViewDetails(card.id)}
					>
						View Transactions
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default CardItem;
