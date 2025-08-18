import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PortfolioStockCard = ({ stock, onSellStock }) => {
	const [showSellForm, setShowSellForm] = useState(false);
	const [sellQuantity, setSellQuantity] = useState("");
	const [loading, setLoading] = useState(false);

	// Safely handle potentially undefined values
	const currentPrice = stock.currentPrice || 0;
	const quantity = stock.quantity || 0;
	const averagePurchasePrice = stock.averagePurchasePrice || 0;
	const gain = stock.gain || 0;
	const gainPercent = stock.gainPercent || 0;

	const isGainPositive = gain >= 0;
	const currentValue = currentPrice * quantity;

	const handleSell = async () => {
		if (!sellQuantity || sellQuantity <= 0 || sellQuantity > quantity)
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
				<div>
					<h6 className="fw-bold mb-1">{stock.symbol}</h6>
					<p className="text-muted small mb-0">{stock.name}</p>
					<p className="text-muted small mb-0">{quantity} shares</p>
				</div>
				<div className="text-end">
					<h5 className="mb-1 fw-bold">${currentPrice.toFixed(2)}</h5>
					<div
						className={`small ${
							isGainPositive ? "text-success" : "text-danger"
						}`}
					>
						{isGainPositive ? (
							<TrendingUp size={14} />
						) : (
							<TrendingDown size={14} />
						)}
						<span className="ms-1">
							{isGainPositive ? "+" : ""}${gain.toFixed(2)}(
							{isGainPositive ? "+" : ""}
							{gainPercent.toFixed(2)}%)
						</span>
					</div>
				</div>
			</div>

			{/* Portfolio metrics */}
			<div className="row g-2 mb-3 small">
				<div className="col-6">
					<div className="text-muted">Avg Purchase</div>
					<div className="fw-medium">
						${averagePurchasePrice.toFixed(2)}
					</div>
				</div>
				<div className="col-6">
					<div className="text-muted">Current Value</div>
					<div className="fw-medium">${currentValue.toFixed(2)}</div>
				</div>
				<div className="col-6">
					<div className="text-muted">Total Invested</div>
					<div className="fw-medium">
						${(averagePurchasePrice * quantity).toFixed(2)}
					</div>
				</div>
				<div className="col-6">
					<div className="text-muted">Day Change</div>
					<div
						className={`fw-medium ${
							gain >= 0 ? "text-success" : "text-danger"
						}`}
					>
						${gain.toFixed(2)}
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
							max={quantity}
						/>
						<div className="small text-muted mt-1">
							Max: {quantity} shares
							{sellQuantity && (
								<span className="d-block">
									Total Value: $
									{(sellQuantity * currentPrice).toFixed(2)}
								</span>
							)}
						</div>
					</div>
					<div className="d-flex gap-2">
						<Button
							variant="danger"
							size="sm"
							onClick={handleSell}
							disabled={
								loading ||
								!sellQuantity ||
								sellQuantity <= 0 ||
								sellQuantity > quantity
							}
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

const Portfolio = ({
	portfolio,
	totalValue,
	totalGain,
	totalGainPercent,
	onSellStock,
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

	return (
		<div className="col-12">
			{/* Portfolio Summary */}
			<Card className="mb-4">
				<div className="row g-4 text-center">
					<div className="col-md-4">
						<h3 className="fw-bold text-primary mb-1">
							${totalValue.toLocaleString()}
						</h3>
						<p className="text-muted mb-0">Total Portfolio Value</p>
					</div>
					<div className="col-md-4">
						<h4
							className={`fw-bold mb-1 ${
								totalGain >= 0 ? "text-success" : "text-danger"
							}`}
						>
							{totalGain >= 0 ? "+" : ""}$
							{totalGain.toLocaleString()}
						</h4>
						<p className="text-muted mb-0">Total Gain/Loss</p>
					</div>
					<div className="col-md-4">
						<h4
							className={`fw-bold mb-1 ${
								totalGainPercent >= 0
									? "text-success"
									: "text-danger"
							}`}
						>
							{totalGainPercent >= 0 ? "+" : ""}
							{totalGainPercent.toFixed(2)}%
						</h4>
						<p className="text-muted mb-0">Total Return</p>
					</div>
				</div>
			</Card>

			{/* Portfolio Holdings */}
			<div className="row g-4">
				{portfolio.map((stock) => (
					<div key={stock.id} className="col-lg-4 col-md-6">
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
