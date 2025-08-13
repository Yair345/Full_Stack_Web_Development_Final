import { AlertCircle, CreditCard } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TransactionItem from "./TransactionItem";

const TransactionList = ({ transactions, loading, error }) => {
	if (loading) {
		return (
			<Card>
				<div className="text-center py-5">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-3 text-muted">Loading transactions...</p>
				</div>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<div className="text-center py-5">
					<div className="text-danger mb-3">
						<AlertCircle size={48} />
					</div>
					<h5 className="text-danger">Error Loading Transactions</h5>
					<p className="text-muted">{error}</p>
					<Button
						variant="primary"
						onClick={() => window.location.reload()}
					>
						Retry
					</Button>
				</div>
			</Card>
		);
	}

	if (transactions.length === 0) {
		return (
			<Card>
				<div className="text-center py-5">
					<div className="text-muted mb-3">
						<CreditCard size={48} />
					</div>
					<h5 className="text-muted">No Transactions Found</h5>
					<p className="text-muted">
						Try adjusting your search or filters
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card>
			<div className="table-responsive">
				<table className="table table-hover mb-0">
					<thead className="table-light">
						<tr>
							<th className="border-0">Transaction</th>
							<th className="border-0">Amount</th>
							<th className="border-0">Category</th>
							<th className="border-0">Account</th>
							<th className="border-0">Date</th>
							<th className="border-0">Status</th>
						</tr>
					</thead>
					<tbody>
						{transactions.map((transaction) => (
							<TransactionItem
								key={transaction.id}
								transaction={transaction}
							/>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	);
};

export default TransactionList;
