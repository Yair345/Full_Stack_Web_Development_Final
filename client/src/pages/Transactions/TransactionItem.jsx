import { ArrowUpCircle, ArrowDownCircle, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/helpers";

const TransactionItem = ({ transaction }) => {
	const getTransactionIcon = (type) => {
		switch (type) {
			case "credit":
				return <ArrowDownCircle className="text-success" size={20} />;
			case "debit":
				return <ArrowUpCircle className="text-danger" size={20} />;
			case "transfer":
				return <ArrowUpCircle className="text-primary" size={20} />;
			case "deposit":
				return <ArrowDownCircle className="text-success" size={20} />;
			case "withdrawal":
				return <ArrowUpCircle className="text-danger" size={20} />;
			default:
				return <CreditCard className="text-muted" size={20} />;
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "completed":
				return "badge bg-success";
			case "pending":
				return "badge bg-warning";
			case "failed":
				return "badge bg-danger";
			case "cancelled":
				return "badge bg-secondary";
			default:
				return "badge bg-secondary";
		}
	};

	// Get the account to display (preferring "to account" for transfers and deposits)
	const getDisplayAccount = () => {
		if (transaction.toAccount) {
			return `${transaction.toAccount.name || "Account"} (${
				transaction.toAccount.account_number
			})`;
		} else if (transaction.fromAccount) {
			return `${transaction.fromAccount.name || "Account"} (${
				transaction.fromAccount.account_number
			})`;
		}
		return transaction.account || "Unknown Account";
	};

	return (
		<tr>
			<td>
				<div className="d-flex align-items-center">
					<div className="me-3">
						{getTransactionIcon(transaction.transaction_type)}
					</div>
					<div>
						<div className="fw-medium">
							{transaction.description || "No description"}
						</div>
						<div className="small text-muted">
							Ref: {transaction.transaction_ref}
						</div>
					</div>
				</div>
			</td>
			<td>
				<span
					className={`fw-bold ${
						transaction.amount >= 0 ? "text-success" : "text-danger"
					}`}
				>
					{transaction.amount >= 0 ? "+" : ""}
					{formatCurrency(transaction.amount)}
				</span>
			</td>
			<td>
				<span className="badge bg-light text-dark">
					{transaction.transaction_type}
				</span>
			</td>
			<td className="text-muted small">{getDisplayAccount()}</td>
			<td className="text-muted small">
				{formatDate(transaction.created_at || transaction.createdAt, {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})}
			</td>
			<td>
				<span className={getStatusBadge(transaction.status)}>
					{transaction.status}
				</span>
			</td>
		</tr>
	);
};

export default TransactionItem;
