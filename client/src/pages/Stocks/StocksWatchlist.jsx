import { useState } from "react";
import { TrendingUp, TrendingDown, Trash2, ShoppingCart } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const WatchlistStockCard = ({ stock, onRemoveFromWatchlist, onBuyStock }) => {
	const [showBuyForm, setShowBuyForm] = useState(false);
	const [quantity, setQuantity] = useState("");
	const [loading, setLoading] = useState(false);

	// Safely handle potentially undefined values
	const currentPrice = stock.currentPrice || 0;
	const change = stock.change || 0;
	const changePercent = stock.changePercent || 0;
	const symbol = stock.symbol || "";
	const name = stock.name || "";
	const addedDate = stock.addedDate || new Date();

	const isPositive = change >= 0;

	const handleBuy = async () => {
		if (!quantity || quantity <= 0) return;

		setLoading(true);
		try {
			await onBuyStock(symbol, quantity, currentPrice);
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
				<div>
					<h6 className="fw-bold mb-1">{symbol}</h6>
					<p className="text-muted small mb-1">{name}</p>
					<p className="text-muted small mb-0">
						Added: {formatDate(addedDate)}
					</p>
				</div>
				<div className="text-end">
					<h5 className="mb-1 fw-bold">${currentPrice.toFixed(2)}</h5>
					<div
						className={`small ${
							isPositive ? "text-success" : "text-danger"
						}`}
					>
						{isPositive ? (
							<TrendingUp size={14} />
						) : (
							<TrendingDown size={14} />
						)}
						<span className="ms-1">
							{isPositive ? "+" : ""}${change.toFixed(2)}(
							{isPositive ? "+" : ""}
							{changePercent.toFixed(2)}%)
						</span>
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
								Total: ${(quantity * currentPrice).toFixed(2)}
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
