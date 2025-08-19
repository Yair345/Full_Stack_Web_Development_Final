import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency, formatDate } from "./dashboardUtils";

const TransactionItem = ({ transaction, isLast }) => {
	// Handle both mock data format and real API format
	const getTransactionIcon = () => {
		// For real API data, check the amount and transaction type
		if (transaction.amount > 0 || transaction.type === "credit") {
			return <ArrowUpRight size={20} className="text-success" />;
		}
		return <ArrowDownRight size={20} className="text-danger" />;
	};

	const getAmountClass = () => {
		return transaction.amount >= 0 ? "text-success" : "text-danger";
	};

	// Get transaction description - handle both formats
	const getDescription = () => {
		if (transaction.description) {
			return transaction.description;
		}
		// Fallback for API format
		return transaction.merchant || "Transaction";
	};

	// Get transaction date - handle both formats
	const getDate = () => {
		if (transaction.date) {
			return transaction.date;
		}
		// Handle API format dates
		return (
			transaction.created_at ||
			transaction.processed_at ||
			new Date().toISOString()
		);
	};

	return (
		<div
			className={`list-group-item d-flex align-items-center justify-content-between py-3 ${
				isLast ? "border-bottom-0" : ""
			}`}
		>
			<div className="d-flex align-items-center">
				<div className="flex-shrink-0">{getTransactionIcon()}</div>
				<div className="ms-3">
					<p className="fw-medium mb-1">{getDescription()}</p>
					<p className="small text-muted mb-0 d-flex align-items-center">
						<Calendar size={14} className="me-1" />
						{formatDate(getDate())}
					</p>
				</div>
			</div>
			<div className="text-end">
				<p className={`small fw-semibold mb-0 ${getAmountClass()}`}>
					{transaction.amount >= 0 ? "+" : ""}
					{formatCurrency(transaction.amount)}
				</p>
			</div>
		</div>
	);
};

const RecentTransactions = ({ transactions, onViewAll }) => {
	// Ensure transactions is always an array
	const transactionsList = Array.isArray(transactions) ? transactions : [];

	return (
		<div className="col-12">
			<Card>
				<div className="d-flex align-items-center justify-content-between mb-4">
					<h2 className="h5 fw-medium mb-0">Recent Transactions</h2>
					{transactionsList.length > 0 && (
						<button
							className="btn btn-link text-primary p-0 small"
							onClick={onViewAll}
						>
							View all
						</button>
					)}
				</div>

				{transactionsList.length > 0 ? (
					<div className="list-group list-group-flush">
						{transactionsList
							.slice(0, 10)
							.map((transaction, index) => (
								<TransactionItem
									key={transaction.id || index}
									transaction={transaction}
									isLast={
										index ===
										Math.min(transactionsList.length - 1, 9)
									}
								/>
							))}
					</div>
				) : (
					<div className="text-center py-4">
						<ArrowUpRight size={48} className="text-muted mb-3" />
						<p className="text-muted">No recent transactions</p>
						<p className="small text-muted">
							Your recent transactions will appear here
						</p>
					</div>
				)}
			</Card>
		</div>
	);
};

export default RecentTransactions;
