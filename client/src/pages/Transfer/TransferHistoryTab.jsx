import {
	History,
	ArrowUpRight,
	ArrowDownRight,
	ArrowRightLeft,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatCurrency } from "./transferUtils";

const TransferHistoryTab = ({ transactions = [], loading = false }) => {
	const getTransactionIcon = (transaction) => {
		if (
			transaction.transaction_type === "internal_transfer" ||
			transaction.transaction_type === "transfer"
		) {
			return <ArrowRightLeft size={16} className="text-primary" />;
		} else if (transaction.transaction_type === "deposit") {
			return <ArrowDownRight size={16} className="text-success" />;
		} else if (transaction.transaction_type === "withdrawal") {
			return <ArrowUpRight size={16} className="text-danger" />;
		}
		return <ArrowRightLeft size={16} className="text-muted" />;
	};

	const getTransactionDirection = (transaction) => {
		// TODO: This logic should be improved once we have user account IDs to compare
		if (transaction.transaction_type === "deposit") {
			return "received";
		} else if (transaction.transaction_type === "withdrawal") {
			return "sent";
		}
		// For transfers, we need to determine based on account ownership
		return "transfer";
	};

	const formatTransactionAmount = (transaction) => {
		const direction = getTransactionDirection(transaction);
		const amount = formatCurrency(transaction.amount);

		if (direction === "received") {
			return `+${amount}`;
		} else if (direction === "sent") {
			return `-${amount}`;
		}
		return amount;
	};

	const getAmountClass = (transaction) => {
		const direction = getTransactionDirection(transaction);

		if (direction === "received") {
			return "text-success";
		} else if (direction === "sent") {
			return "text-danger";
		}
		return "text-primary";
	};

	if (loading) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<div
							className="spinner-border text-primary"
							role="status"
						>
							<span className="visually-hidden">Loading...</span>
						</div>
						<p className="text-muted mt-3">
							Loading transfer history...
						</p>
					</div>
				</Card>
			</div>
		);
	}

	if (!transactions || transactions.length === 0) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<History size={48} className="text-muted mb-3" />
						<h5 className="fw-medium mb-2">No Transfer History</h5>
						<p className="text-muted mb-4">
							You haven't made any transfers yet. Start by making
							your first transfer!
						</p>
						<Button variant="outline">Make a Transfer</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex align-items-center justify-content-between mb-4">
					<h5 className="fw-medium mb-0">Transfer History</h5>
					<Button variant="outline" size="sm">
						Download Report
					</Button>
				</div>

				<div className="table-responsive">
					<table className="table table-hover">
						<thead className="table-light">
							<tr>
								<th>Date</th>
								<th>Transaction</th>
								<th>Type</th>
								<th>Status</th>
								<th className="text-end">Amount</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((transaction) => (
								<tr key={transaction.id}>
									<td>
										<div className="small text-muted">
											{new Date(
												transaction.created_at
											).toLocaleDateString()}
										</div>
										<div className="small text-muted">
											{new Date(
												transaction.created_at
											).toLocaleTimeString()}
										</div>
									</td>
									<td>
										<div className="d-flex align-items-center">
											{getTransactionIcon(transaction)}
											<div className="ms-2">
												<div className="fw-medium">
													{transaction.description ||
														"Transfer"}
												</div>
												<div className="small text-muted">
													{
														transaction.fromAccount
															?.account_number
													}{" "}
													→{" "}
													{
														transaction.toAccount
															?.account_number
													}
												</div>
											</div>
										</div>
									</td>
									<td>
										<span className="badge bg-light text-dark">
											{transaction.transaction_type
												.replace("_", " ")
												.toUpperCase()}
										</span>
									</td>
									<td>
										<span
											className={`badge ${
												transaction.status ===
												"completed"
													? "bg-success"
													: transaction.status ===
													  "pending"
													? "bg-warning"
													: "bg-danger"
											}`}
										>
											{transaction.status.toUpperCase()}
										</span>
									</td>
									<td
										className={`text-end fw-medium ${getAmountClass(
											transaction
										)}`}
									>
										{formatTransactionAmount(transaction)}
									</td>
									<td>
										<Button variant="outline" size="sm">
											View Details
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{transactions.length > 10 && (
					<div className="text-center mt-4">
						<Button variant="outline">
							Load More Transactions
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
};

export default TransferHistoryTab;
