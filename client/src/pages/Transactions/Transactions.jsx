import { useState, useMemo } from "react";
import { Download, RefreshCcw } from "lucide-react";
import Button from "../../components/ui/Button";
import TransactionSummaryCards from "./TransactionSummaryCards";
import TransactionFilters from "./TransactionFilters";
import TransactionList from "./TransactionList";
import {
	useTransactions,
	useTransactionSummary,
} from "../../hooks/api/apiHooks";
import { filterTransactions, exportTransactions } from "./transactionUtils";

const Transactions = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);
	const [localFilters, setLocalFilters] = useState({
		dateFrom: "",
		dateTo: "",
		type: "all",
		minAmount: "",
		maxAmount: "",
	});

	// Convert local filters to API format
	const apiFilters = useMemo(() => {
		const filters = {
			page: currentPage,
			limit: pageSize,
		};

		if (localFilters.dateFrom) {
			filters.start_date = localFilters.dateFrom;
		}
		if (localFilters.dateTo) {
			filters.end_date = localFilters.dateTo;
		}
		if (localFilters.type && localFilters.type !== "all") {
			filters.type = localFilters.type;
		}
		if (localFilters.minAmount) {
			filters.minAmount = localFilters.minAmount;
		}
		if (localFilters.maxAmount) {
			filters.maxAmount = localFilters.maxAmount;
		}

		return filters;
	}, [localFilters, currentPage, pageSize]);

	// Use the transactions hook
	const { transactions, pagination, loading, error, refetch } =
		useTransactions(apiFilters);

	// Use the transaction summary hook
	const {
		summary,
		loading: summaryLoading,
		error: summaryError,
	} = useTransactionSummary(apiFilters);

	// Apply client-side filtering for search term (since API might not support text search)
	const filteredTransactions = useMemo(() => {
		if (!searchTerm) return transactions;
		return filterTransactions(transactions, searchTerm, {});
	}, [transactions, searchTerm]);

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
		setCurrentPage(1); // Reset to first page when clearing filters
	};

	const handleRefresh = async () => {
		try {
			await Promise.all([refetch()]);
		} catch (error) {
			console.error("Failed to refresh data:", error);
		}
	};

	const handleExport = () => {
		exportTransactions(filteredTransactions);
	};

	// Pagination helpers
	const getVisiblePageNumbers = () => {
		if (!pagination) return [];

		const totalPages = pagination.total_pages;
		const maxVisible = 5;
		const current = currentPage;

		if (totalPages <= maxVisible) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const start = Math.max(
			1,
			Math.min(current - 2, totalPages - maxVisible + 1)
		);
		const end = Math.min(totalPages, start + maxVisible - 1);

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	};

	const getPaginationInfo = () => {
		if (!pagination) return { start: 0, end: 0, total: 0 };

		const start = (currentPage - 1) * pageSize + 1;
		const end = Math.min(currentPage * pageSize, pagination.total_records);
		const total = pagination.total_records;

		return { start, end, total };
	};

	const canGoPrevious = currentPage > 1;
	const canGoNext = pagination && currentPage < pagination.total_pages;
	const visiblePages = getVisiblePageNumbers();
	const paginationInfo = getPaginationInfo();

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
					<div className="d-flex gap-2">
						<Button
							variant="outline"
							className="d-flex align-items-center"
							onClick={handleRefresh}
							disabled={loading || summaryLoading}
						>
							<RefreshCcw size={16} className="me-2" />
							Refresh
						</Button>
						<Button
							variant="outline"
							className="d-flex align-items-center"
							onClick={handleExport}
						>
							<Download size={16} className="me-2" />
							Export
						</Button>
					</div>
				</div>

				<TransactionSummaryCards
					transactions={filteredTransactions}
					summary={summary}
					summaryLoading={summaryLoading}
					summaryError={summaryError}
				/>

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
					onRefresh={handleRefresh}
				/>

				{/* Pagination */}
				{pagination && pagination.total_pages > 1 && (
					<div className="row mt-4">
						<div className="col-12">
							<nav aria-label="Transaction pagination">
								<ul className="pagination justify-content-center">
									{/* Previous Button */}
									<li
										className={`page-item ${
											!canGoPrevious ? "disabled" : ""
										}`}
									>
										<button
											className="page-link"
											onClick={() =>
												setCurrentPage(currentPage - 1)
											}
											disabled={!canGoPrevious}
										>
											Previous
										</button>
									</li>

									{/* Page Numbers */}
									{visiblePages.map((pageNum) => (
										<li
											key={pageNum}
											className={`page-item ${
												currentPage === pageNum
													? "active"
													: ""
											}`}
										>
											<button
												className="page-link"
												onClick={() =>
													setCurrentPage(pageNum)
												}
											>
												{pageNum}
											</button>
										</li>
									))}

									{/* Next Button */}
									<li
										className={`page-item ${
											!canGoNext ? "disabled" : ""
										}`}
									>
										<button
											className="page-link"
											onClick={() =>
												setCurrentPage(currentPage + 1)
											}
											disabled={!canGoNext}
										>
											Next
										</button>
									</li>
								</ul>
							</nav>

							{/* Pagination Info */}
							<div className="text-center text-muted small">
								Showing {paginationInfo.start} to{" "}
								{paginationInfo.end} of {paginationInfo.total}{" "}
								transactions
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Transactions;
