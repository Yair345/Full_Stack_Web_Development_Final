import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency, formatDate } from "./dashboardUtils";

const TransactionItem = ({ transaction, isLast }) => {
	const getTransactionIcon = () => {
		return transaction.type === "credit" ? (
			<ArrowUpRight size={20} className="text-success" />
		) : (
			<ArrowDownRight size={20} className="text-danger" />
		);
	};

	const getAmountClass = () => {
		return transaction.amount >= 0 ? "text-success" : "text-danger";
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
					<p className="fw-medium mb-1">{transaction.description}</p>
					<p className="small text-muted mb-0 d-flex align-items-center">
						<Calendar size={14} className="me-1" />
						{formatDate(transaction.date)}
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
	return (
		<div className="col-12">
			<Card>
				<div className="d-flex align-items-center justify-content-between mb-4">
					<h2 className="h5 fw-medium mb-0">Recent Transactions</h2>
					<button
						className="btn btn-link text-primary p-0 small"
						onClick={onViewAll}
					>
						View all
					</button>
				</div>

				{transactions.length > 0 ? (
					<div className="list-group list-group-flush">
						{transactions.map((transaction, index) => (
							<TransactionItem
								key={transaction.id}
								transaction={transaction}
								isLast={index === transactions.length - 1}
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
