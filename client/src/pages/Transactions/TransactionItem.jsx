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
			default:
				return "badge bg-secondary";
		}
	};

	return (
		<tr>
			<td>
				<div className="d-flex align-items-center">
					<div className="me-3">
						{getTransactionIcon(transaction.type)}
					</div>
					<div>
						<div className="fw-medium">
							{transaction.description}
						</div>
						<div className="small text-muted">
							{transaction.merchant}
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
					{transaction.category}
				</span>
			</td>
			<td className="text-muted small">{transaction.account}</td>
			<td className="text-muted small">
				{formatDate(transaction.date, {
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
