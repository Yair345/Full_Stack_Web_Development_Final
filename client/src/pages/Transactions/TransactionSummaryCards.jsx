import { ArrowDownCircle, ArrowUpCircle, Building } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency } from "../../utils/helpers";

const TransactionSummaryCards = ({
	transactions,
	summary,
	summaryLoading,
	summaryError,
}) => {
	// If we have API summary data, use it; otherwise calculate from transactions
	let totalIncome, totalExpenses, totalTransactions;

	if (summary && !summaryError) {
		totalIncome = summary.total_amount_received || 0;
		totalExpenses = Math.abs(summary.total_amount_sent || 0);
		totalTransactions = summary.total_transactions || 0;
	} else {
		// Fallback to client-side calculation
		totalIncome = transactions
			.filter((t) => t.type === "credit")
			.reduce((sum, t) => sum + Math.abs(t.amount), 0);

		totalExpenses = Math.abs(
			transactions
				.filter((t) => t.type === "debit")
				.reduce((sum, t) => sum + Math.abs(t.amount), 0)
		);

		totalTransactions = transactions.length;
	}

	// Show loading state for summary cards
	if (summaryLoading) {
		return (
			<div className="row g-3 mb-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="col-md-4">
						<Card className="text-center">
							<div
								className="spinner-border spinner-border-sm text-primary mb-2"
								role="status"
							>
								<span className="visually-hidden">
									Loading...
								</span>
							</div>
							<div className="placeholder-glow">
								<span className="placeholder col-6 mb-1"></span>
								<br />
								<span className="placeholder col-4"></span>
							</div>
						</Card>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="row g-3 mb-4">
			<div className="col-md-4">
				<Card className="text-center">
					<div className="text-success mb-2">
						<ArrowDownCircle size={24} />
					</div>
					<h5 className="fw-bold text-success mb-1">
						{formatCurrency(totalIncome)}
					</h5>
					<p className="small text-muted mb-0">Total Income</p>
				</Card>
			</div>
			<div className="col-md-4">
				<Card className="text-center">
					<div className="text-danger mb-2">
						<ArrowUpCircle size={24} />
					</div>
					<h5 className="fw-bold text-danger mb-1">
						{formatCurrency(totalExpenses)}
					</h5>
					<p className="small text-muted mb-0">Total Expenses</p>
				</Card>
			</div>
			<div className="col-md-4">
				<Card className="text-center">
					<div className="text-primary mb-2">
						<Building size={24} />
					</div>
					<h5 className="fw-bold text-primary mb-1">
						{totalTransactions}
					</h5>
					<p className="small text-muted mb-0">Total Transactions</p>
				</Card>
			</div>
		</div>
	);
};

export default TransactionSummaryCards;
