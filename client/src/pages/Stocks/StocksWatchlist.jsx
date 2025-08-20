import { useState } from "react";
import { Trash2, ShoppingCart } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { StockPriceDisplay, StockInfoDisplay } from "./StockDisplayCommon";
import { stockDataUtils } from "./stocksUtils";
import { stocksService } from "../../services/stocksService";

const WatchlistStockCard = ({ stock, marketData, onRemoveFromWatchlist, onBuyStock }) => {
	const [showBuyForm, setShowBuyForm] = useState(false);
	const [quantity, setQuantity] = useState("");
	const [loading, setLoading] = useState(false);

	// Use market data merged with watchlist data for consistency
	const normalized = stockDataUtils.mergeWithMarketData(stock, marketData, 'watchlist');

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

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<Card className="h-100">
			<div className="d-flex justify-content-between align-items-start mb-3">
				<StockInfoDisplay stock={stock} source="watchlist" />
				<StockPriceDisplay stock={stock} source="watchlist" />
			</div>
			<div className="mb-3">
				<div className="row g-2 small text-muted">
					<div className="col-6">
						<div>High: {stockDataUtils.formatPrice(normalized.dayHigh)}</div>
						<div>Low: {stockDataUtils.formatPrice(normalized.dayLow)}</div>
					</div>
					<div className="col-6">
						<div>Volume: {normalized.volume.toLocaleString()}</div>
						<div>Added: {formatDate(normalized.addedDate)}</div>
					</div>
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
						variant="outline-danger"
						size="sm"
						onClick={() => onRemoveFromWatchlist(stock.id)}
					>
						<Trash2 size={14} />
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
								Total: {stockDataUtils.formatPrice(quantity * normalized.currentPrice)}
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

const StocksWatchlist = ({
	watchlist,
	marketData = [],
	onRemoveFromWatchlist,
	onBuyStock,
	loading,
}) => {
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
						<p className="text-muted mt-2">Loading watchlist...</p>
					</div>
				</Card>
			</div>
		);
	}

	if (watchlist.length === 0) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<span style={{ fontSize: "3rem" }}>👁️</span>
						<h5 className="mt-3 mb-2">Your Watchlist is Empty</h5>
						<p className="text-muted">
							Add stocks to your watchlist from the Market tab to
							track their performance.
						</p>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="col-12">
			{/* Watchlist Header */}
			<Card className="mb-4">
				<div className="d-flex justify-content-between align-items-center">
					<h5 className="mb-0">Your Watchlist</h5>
					<div className="text-muted">
						{watchlist.length} stock
						{watchlist.length !== 1 ? "s" : ""} tracked
					</div>
				</div>
			</Card>

			{/* Watchlist Stocks */}
			<div className="row g-4">
				{watchlist.map((stock) => (
					<div key={stock.id} className="col-lg-4 col-md-6">
						<WatchlistStockCard
							stock={stock}
							marketData={marketData}
							onRemoveFromWatchlist={onRemoveFromWatchlist}
							onBuyStock={onBuyStock}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default StocksWatchlist;
