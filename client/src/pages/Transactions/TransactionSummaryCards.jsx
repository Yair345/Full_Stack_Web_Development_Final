import { ArrowDownCircle, ArrowUpCircle, Building } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency } from "../../utils/helpers";

const TransactionSummaryCards = ({ transactions }) => {
	const totalIncome = transactions
		.filter((t) => t.type === "credit")
		.reduce((sum, t) => sum + t.amount, 0);

	const totalExpenses = Math.abs(
		transactions
			.filter((t) => t.type === "debit")
			.reduce((sum, t) => sum + t.amount, 0)
	);

	const totalTransactions = transactions.length;

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
