import { useState } from "react";
import { Search, Filter } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const TransactionFilters = ({
	searchTerm,
	setSearchTerm,
	localFilters,
	setLocalFilters,
	onClearFilters,
	hasActiveFilters,
}) => {
	const [showFilters, setShowFilters] = useState(false);

	const handleFilterChange = (field, value) => {
		setLocalFilters((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<Card className="mb-4">
			<div className="d-flex flex-wrap gap-3 align-items-center">
				<div className="flex-grow-1" style={{ minWidth: "250px" }}>
					<div className="position-relative">
						<Search
							size={16}
							className="position-absolute top-50 translate-middle-y ms-3 text-muted"
						/>
						<input
							type="text"
							className="form-control ps-5"
							placeholder="Search transactions..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
				<Button
					variant="outline"
					onClick={() => setShowFilters(!showFilters)}
					className="d-flex align-items-center"
				>
					<Filter size={16} className="me-2" />
					Filters
				</Button>
				{hasActiveFilters && (
					<Button variant="outline" onClick={onClearFilters}>
						Clear Filters
					</Button>
				)}
			</div>

			{showFilters && (
				<div className="border-top mt-3 pt-3">
					<div className="row g-3">
						<div className="col-md-3">
							<label className="form-label small">
								Date From
							</label>
							<input
								type="date"
								className="form-control"
								value={localFilters.dateFrom}
								onChange={(e) =>
									handleFilterChange(
										"dateFrom",
										e.target.value
									)
								}
							/>
						</div>
						<div className="col-md-3">
							<label className="form-label small">Date To</label>
							<input
								type="date"
								className="form-control"
								value={localFilters.dateTo}
								onChange={(e) =>
									handleFilterChange("dateTo", e.target.value)
								}
							/>
						</div>
						<div className="col-md-2">
							<label className="form-label small">Type</label>
							<select
								className="form-select"
								value={localFilters.type}
								onChange={(e) =>
									handleFilterChange("type", e.target.value)
								}
							>
								<option value="all">All Types</option>
								<option value="income">Income</option>
								<option value="expense">Expenses</option>
								<option value="deposit">Deposits</option>
								<option value="withdrawal">Withdrawals</option>
								<option value="transfer">Transfers</option>
								<option value="payment">Payments</option>
								<option value="stock_purchase">
									Stock Purchases
								</option>
								<option value="stock_sale">Stock Sales</option>
							</select>
						</div>
						<div className="col-md-2">
							<label className="form-label small">
								Min Amount
							</label>
							<input
								type="number"
								className="form-control"
								placeholder="0.00"
								value={localFilters.minAmount}
								onChange={(e) =>
									handleFilterChange(
										"minAmount",
										e.target.value
									)
								}
							/>
						</div>
						<div className="col-md-2">
							<label className="form-label small">
								Max Amount
							</label>
							<input
								type="number"
								className="form-control"
								placeholder="0.00"
								value={localFilters.maxAmount}
								onChange={(e) =>
									handleFilterChange(
										"maxAmount",
										e.target.value
									)
								}
							/>
						</div>
					</div>
				</div>
			)}
		</Card>
	);
};

export default TransactionFilters;
