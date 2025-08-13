import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Download } from "lucide-react";
import Button from "../../components/ui/Button";
import TransactionSummaryCards from "./TransactionSummaryCards";
import TransactionFilters from "./TransactionFilters";
import TransactionList from "./TransactionList";
import {
	fetchTransactionsStart,
	fetchTransactionsSuccess,
	fetchTransactionsFailure,
} from "../../store/slices/transactionSlice";
import {
	mockTransactions,
	filterTransactions,
	exportTransactions,
} from "./transactionUtils";

const Transactions = () => {
	const dispatch = useDispatch();
	const { transactions, loading, error } = useSelector(
		(state) => state.transactions
	);

	const [searchTerm, setSearchTerm] = useState("");
	const [localFilters, setLocalFilters] = useState({
		dateFrom: "",
		dateTo: "",
		type: "all",
		minAmount: "",
		maxAmount: "",
	});

	useEffect(() => {
		// For demo purposes, use mock data
		// In a real app, you'd fetch from the API
		dispatch(fetchTransactionsStart());
		setTimeout(() => {
			dispatch(fetchTransactionsSuccess(mockTransactions));
		}, 1000);
	}, [dispatch]);

	const filteredTransactions = useMemo(() => {
		return filterTransactions(transactions, searchTerm, localFilters);
	}, [transactions, searchTerm, localFilters]);

	const hasActiveFilters =
		searchTerm ||
		localFilters.type !== "all" ||
		localFilters.dateFrom ||
		localFilters.dateTo ||
		localFilters.minAmount ||
		localFilters.maxAmount;

	const clearFilters = () => {
		setLocalFilters({
			dateFrom: "",
			dateTo: "",
			type: "all",
			minAmount: "",
			maxAmount: "",
		});
		setSearchTerm("");
	};

	const handleExport = () => {
		exportTransactions(filteredTransactions);
	};

	return (
		<div className="row g-4">
			<div className="col-12">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<div>
						<h1 className="h2 fw-bold text-dark mb-1">
							Transactions
						</h1>
						<p className="text-muted mb-0">
							View your transaction history and manage payments
						</p>
					</div>
					<Button
						variant="outline"
						className="d-flex align-items-center"
						onClick={handleExport}
					>
						<Download size={16} className="me-2" />
						Export
					</Button>
				</div>

				<TransactionSummaryCards transactions={filteredTransactions} />

				<TransactionFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					localFilters={localFilters}
					setLocalFilters={setLocalFilters}
					onClearFilters={clearFilters}
					hasActiveFilters={hasActiveFilters}
				/>

				<TransactionList
					transactions={filteredTransactions}
					loading={loading}
					error={error}
				/>
			</div>
		</div>
	);
};

export default Transactions;
