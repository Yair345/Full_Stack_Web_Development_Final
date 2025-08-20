import { useState } from "react";
import { Minus } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { StockPriceDisplay, StockInfoDisplay, DailyChangeDisplay } from "./StockDisplayCommon";
import { stockDataUtils } from "./stocksUtils";

const PortfolioStockCard = ({ stock, onSellStock }) => {
	const [showSellForm, setShowSellForm] = useState(false);
	const [sellQuantity, setSellQuantity] = useState("");
	const [loading, setLoading] = useState(false);

	// Use normalized data for consistency
	const normalized = stockDataUtils.normalizeStockData(stock, 'portfolio');
	const isDailyChangePositive = stockDataUtils.isDailyChangePositive(normalized);
	const isOverallGainPositive = normalized.totalGain >= 0;

	const handleSell = async () => {
		if (!sellQuantity || sellQuantity <= 0 || sellQuantity > normalized.quantity)
			return;

		setLoading(true);
		try {
			await onSellStock(stock.id, sellQuantity);
			setShowSellForm(false);
			setSellQuantity("");
		} catch (error) {
			console.error("Failed to sell stock:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="h-100">
			<div className="d-flex justify-content-between align-items-start mb-3">
				<StockInfoDisplay stock={stock} source="portfolio" />
				<StockPriceDisplay stock={stock} source="portfolio" />
			</div>

			{/* Portfolio metrics */}
			<div className="row g-2 mb-3 small">
				<div className="col-6">
					<div className="text-muted">Shares</div>
					<div className="fw-medium">{normalized.quantity}</div>
				</div>
				<div className="col-6">
					<div className="text-muted">Avg. Cost</div>
					<div className="fw-medium">{stockDataUtils.formatPrice(normalized.averagePurchasePrice)}</div>
				</div>
				<div className="col-6">
					<div className="text-muted">Current Value</div>
					<div className="fw-medium">{stockDataUtils.formatPrice(normalized.currentValue)}</div>
				</div>
				<div className="col-6">
					<div className="text-muted">Total Invested</div>
					<div className="fw-medium">
						{stockDataUtils.formatPrice(normalized.averagePurchasePrice * normalized.quantity)}
					</div>
				</div>
				<DailyChangeDisplay stock={stock} source="portfolio" />
				<div className="col-6">
					<div className="text-muted">Total P&L</div>
					<div
						className={`fw-medium ${
							isOverallGainPositive ? "text-success" : "text-danger"
						}`}
					>
						{stockDataUtils.formatPrice(normalized.totalGain)}
					</div>
				</div>
				<div className="col-6">
					<div className="text-muted">Total Return</div>
					<div
						className={`fw-medium ${
							isOverallGainPositive ? "text-success" : "text-danger"
						}`}
					>
						{isOverallGainPositive ? "+" : ""}{normalized.totalGainPercent.toFixed(2)}%
					</div>
				</div>
			</div>

			{!showSellForm ? (
				<Button
					variant="outline-danger"
					size="sm"
					className="w-100"
					onClick={() => setShowSellForm(true)}
				>
					<Minus size={14} className="me-1" />
					Sell
				</Button>
			) : (
				<div className="border-top pt-3">
					<div className="mb-3">
						<label className="form-label small">
							Quantity to Sell
						</label>
						<Input
							type="number"
							value={sellQuantity}
							onChange={(e) => setSellQuantity(e.target.value)}
							placeholder="Number of shares"
							min="1"
							max={normalized.quantity}
						/>
						<div className="small text-muted mt-1">
							Max: {normalized.quantity} shares
							{sellQuantity && (
								<span className="d-block">
									Total Value: {stockDataUtils.formatPrice(normalized.currentPrice * sellQuantity)}
								</span>
							)}
						</div>
					</div>
					<div className="d-flex gap-2">
						<Button
							variant="danger"
							size="sm"
							onClick={handleSell}
							disabled={loading || !sellQuantity || sellQuantity <= 0 || sellQuantity > normalized.quantity}
							className="flex-fill"
						>
							{loading ? "Selling..." : "Confirm Sell"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setShowSellForm(false);
								setSellQuantity("");
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

const Portfolio = ({ portfolio, onSellStock, loading }) => {
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
						<p className="text-muted mt-2">Loading portfolio...</p>
					</div>
				</Card>
			</div>
		);
	}

	if (portfolio.length === 0) {
		return (
			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<span style={{ fontSize: "3rem" }}>💼</span>
						<h5 className="mt-3 mb-2">Your Portfolio is Empty</h5>
						<p className="text-muted">
							Start building your investment portfolio by buying
							some stocks from the Market tab.
						</p>
					</div>
				</Card>
			</div>
		);
	}

	// Calculate portfolio totals using normalized data
	const totalValue = portfolio.reduce((sum, stock) => {
		const normalized = stockDataUtils.normalizeStockData(stock, 'portfolio');
		return sum + normalized.currentValue;
	}, 0);

	const totalGain = portfolio.reduce((sum, stock) => {
		const normalized = stockDataUtils.normalizeStockData(stock, 'portfolio');
		return sum + normalized.totalGain;
	}, 0);

	const totalDailyChange = portfolio.reduce((sum, stock) => {
		const normalized = stockDataUtils.normalizeStockData(stock, 'portfolio');
		return sum + (normalized.dailyChange * normalized.quantity);
	}, 0);

	const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0;

	return (
		<div className="col-12">
			{/* Portfolio Summary */}
			<Card className="mb-4">
				<div className="row g-4 text-center">
					<div className="col-md-4">
						<h3 className="fw-bold text-primary mb-1">
							{stockDataUtils.formatPrice(totalValue)}
						</h3>
						<p className="text-muted mb-0">Total Portfolio Value</p>
					</div>
					<div className="col-md-4">
						<h4
							className={`fw-bold mb-1 ${
								totalGain >= 0 ? "text-success" : "text-danger"
							}`}
						>
							{totalGain >= 0 ? "+" : ""}{stockDataUtils.formatPrice(totalGain)}
						</h4>
						<p className="text-muted mb-0">Total P&L</p>
					</div>
					<div className="col-md-4">
						<h4
							className={`fw-bold mb-1 ${
								totalDailyChange >= 0 ? "text-success" : "text-danger"
							}`}
						>
							{totalDailyChange >= 0 ? "+" : ""}{stockDataUtils.formatPrice(totalDailyChange)}
						</h4>
						<p className="text-muted mb-0">Today's Change</p>
					</div>
				</div>
			</Card>

			{/* Portfolio Holdings */}
			<div className="row g-3">
				{portfolio.map((stock) => (
					<div key={stock.id} className="col-lg-6">
						<PortfolioStockCard
							stock={stock}
							onSellStock={onSellStock}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default Portfolio;
