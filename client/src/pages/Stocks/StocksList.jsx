import { useState } from "react";
import { Eye, ShoppingCart } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { StockPriceDisplay, StockInfoDisplay } from "./StockDisplayCommon";
import { stockDataUtils } from "./stocksUtils";

const StockCard = ({ stock, onBuyStock, onAddToWatchlist }) => {
	const [showBuyForm, setShowBuyForm] = useState(false);
	const [quantity, setQuantity] = useState("");
	const [loading, setLoading] = useState(false);

	// Use normalized data for consistency
	const normalized = stockDataUtils.normalizeStockData(stock, 'market');

	const handleBuy = async () => {
		if (!quantity || quantity <= 0) return;

		setLoading(true);
		try {
			await onBuyStock(normalized.symbol, quantity, normalized.currentPrice);
			setShowBuyForm(false);
			setQuantity("");
		} catch (error) {
			console.error("Failed to buy stock:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="h-100">
			<div className="d-flex justify-content-between align-items-start mb-3">
				<StockInfoDisplay stock={stock} source="market" />
				<StockPriceDisplay stock={stock} source="market" />
			</div>

			<div className="row g-2 mb-3 small text-muted">
				<div className="col-6">
					<div>High: {stockDataUtils.formatPrice(normalized.dayHigh)}</div>
					<div>Low: {stockDataUtils.formatPrice(normalized.dayLow)}</div>
				</div>
				<div className="col-6">
					<div>Volume: {normalized.volume.toLocaleString()}</div>
				</div>
			</div>

			{!showBuyForm ? (
				<div className="d-flex gap-2">
					<Button
						variant="primary"
						size="sm"
						className="flex-fill"
						onClick={() => setShowBuyForm(true)}
					>
						<ShoppingCart size={14} className="me-1" />
						Buy
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onAddToWatchlist(normalized.symbol)}
					>
						<Eye size={14} className="me-1" />
						Watch
					</Button>
				</div>
			) : (
				<div className="border-top pt-3">
					<div className="mb-3">
						<label className="form-label small">Quantity</label>
						<Input
							type="number"
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							placeholder="Number of shares"
							min="1"
						/>
						{quantity && (
							<div className="small text-muted mt-1">
								Total: $
								{(quantity * normalized.currentPrice).toFixed(2)}
							</div>
						)}
					</div>
					<div className="d-flex gap-2">
						<Button
							variant="primary"
							size="sm"
							onClick={handleBuy}
							disabled={loading || !quantity || quantity <= 0}
							className="flex-fill"
						>
							{loading ? "Buying..." : "Confirm Buy"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setShowBuyForm(false);
								setQuantity("");
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
};

const StocksList = ({ stocks, onBuyStock, onAddToWatchlist, loading }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("symbol");

	// Ensure stocks is an array before filtering
	const safeStocks = Array.isArray(stocks) ? stocks : [];

	const filteredStocks = safeStocks
		.filter(
			(stock) =>
				(stock.symbol || "")
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				(stock.name || stock.companyName || "")
					.toLowerCase()
					.includes(searchTerm.toLowerCase())
		)
		.sort((a, b) => {
			switch (sortBy) {
				case "price":
					return (b.price || 0) - (a.price || 0);
				case "change":
					return (b.change || 0) - (a.change || 0);
				case "volume":
					return (b.volume || 0) - (a.volume || 0);
				default:
					return (a.symbol || "").localeCompare(b.symbol || "");
			}
		});

	if (loading) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<div
							className="spinner-border text-primary"
							role="status"
						>
							<span className="visually-hidden">Loading...</span>
						</div>
						<p className="text-muted mt-2">
							Loading market data...
						</p>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="col-12">
			{/* Search and Filter Controls */}
			<Card className="mb-4">
				<div className="row g-3 align-items-center">
					<div className="col-md-6">
						<Input
							type="text"
							placeholder="Search stocks by symbol or name..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div className="col-md-3">
						<select
							className="form-select"
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
						>
							<option value="symbol">Sort by Symbol</option>
							<option value="price">Sort by Price</option>
							<option value="change">Sort by Change</option>
							<option value="volume">Sort by Volume</option>
						</select>
					</div>
					<div className="col-md-3">
						<div className="text-muted small">
							{searchTerm ? (
								<>
									{filteredStocks.length} stocks found
									{safeStocks.length !==
										filteredStocks.length && (
										<span>
											{" "}
											from {safeStocks.length} loaded
										</span>
									)}
								</>
							) : (
								<>{safeStocks.length} stocks loaded</>
							)}
						</div>
					</div>
				</div>
			</Card>

			{/* Stocks Grid */}
			<div className="row g-4">
				{filteredStocks.map((stock, index) => (
					<div
						key={stock.symbol || index}
						className="col-lg-4 col-md-6"
					>
						<StockCard
							stock={stock}
							onBuyStock={onBuyStock}
							onAddToWatchlist={onAddToWatchlist}
						/>
					</div>
				))}
			</div>

			{filteredStocks.length === 0 && (
				<Card>
					<div className="text-center py-4">
						<span style={{ fontSize: "3rem" }}>🔍</span>
						<p className="text-muted mt-2">No stocks found</p>
						<p className="small text-muted">
							Try adjusting your search criteria
						</p>
					</div>
				</Card>
			)}
		</div>
	);
};

export default StocksList;
