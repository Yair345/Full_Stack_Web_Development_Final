import { useState, useEffect } from "react";
import { stocksService } from "../../services/stocksService";

// Import the proper components
import StocksHeader from "./StocksHeader";
import StocksTabs from "./StocksTabs";
import StocksList from "./StocksList";
import Portfolio from "./Portfolio";
import StocksWatchlist from "./StocksWatchlist";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const Stocks = () => {
	const [activeTab, setActiveTab] = useState("market");
	const [availableStocks, setAvailableStocks] = useState([]);
	const [portfolio, setPortfolio] = useState([]);
	const [watchlist, setWatchlist] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Success and error message state
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	// Load initial data from server
	useEffect(() => {
		loadInitialData();
	}, []);

	// Auto-refresh prices when switching between tabs
	useEffect(() => {
		if (activeTab === "market" && availableStocks.length > 0) {
			refreshMarketPrices();
		} else if (activeTab === "portfolio" && portfolio.length > 0) {
			refreshPortfolioPrices();
		} else if (activeTab === "watchlist" && watchlist.length > 0) {
			refreshWatchlistPrices();
		}
	}, [activeTab]);

	const loadInitialData = async () => {
		try {
			setLoading(true);
			setError(null);

			const result = await stocksService.loadInitialData();

			if (result.success) {
				setAvailableStocks(result.data.availableStocks);
				setPortfolio(result.data.portfolio);
				setWatchlist(result.data.watchlist);
			} else {
				setError(result.error);
				// Use fallback data
				setAvailableStocks(result.data.availableStocks);
				setPortfolio(result.data.portfolio);
				setWatchlist(result.data.watchlist);
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const refreshMarketPrices = async () => {
		try {
			console.log('Refreshing market prices...');
			const result = await stocksService.loadAvailableStocks();
			if (result.success) {
				setAvailableStocks(result.data || []);
				console.log('Market prices refreshed successfully');
			}
		} catch (error) {
			console.warn('Failed to refresh market prices:', error);
		}
	};

	const refreshPortfolioPrices = async () => {
		try {
			console.log('Refreshing portfolio prices...');
			const result = await stocksService.getPortfolioWithFreshPrices();
			if (result.success) {
				setPortfolio(result.data);
				console.log('Portfolio prices refreshed successfully');
			}
		} catch (error) {
			console.warn('Failed to refresh portfolio prices:', error);
		}
	};

	const refreshWatchlistPrices = async () => {
		try {
			console.log('Refreshing watchlist prices...');
			const result = await stocksService.getWatchlistWithFreshPrices();
			if (result.success) {
				setWatchlist(result.data);
				console.log('Watchlist prices refreshed successfully');
			}
		} catch (error) {
			console.warn('Failed to refresh watchlist prices:', error);
		}
	};

	const handleRefreshPrices = async () => {
		try {
			setLoading(true);
			const result = await stocksService.updatePrices();
			
			if (result.success) {
				setSuccessMessage(`Prices updated! Market, Portfolio: ${result.data.portfolioUpdated} items, Watchlist: ${result.data.watchlistUpdated} items`);
				
				// Refresh current tab data
				if (activeTab === "market") {
					await refreshMarketPrices();
				} else if (activeTab === "portfolio") {
					await refreshPortfolioPrices();
				} else if (activeTab === "watchlist") {
					await refreshWatchlistPrices();
				}
			} else {
				setErrorMessage(result.message);
			}
		} catch (error) {
			console.error('Failed to refresh prices:', error);
			setErrorMessage('Failed to refresh prices');
		} finally {
			setLoading(false);
		}
	};

	const formatTransactionDetails = (details) => {
		if (!details) return "";

		const formatCurrency = (amount) =>
			new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount);

		let detailString = `${details.quantity} shares of ${details.symbol}`;
		if (details.pricePerShare) {
			detailString += ` at ${formatCurrency(details.pricePerShare)}`;
		}

		if (details.action === "BUY" && details.totalCost) {
			detailString += ` (Total: ${formatCurrency(
				details.totalCost
			)} including fees)`;
		} else if (details.action === "SELL" && details.netAmount) {
			detailString += ` (Net: ${formatCurrency(
				details.netAmount
			)} after fees)`;
		}

		if (details.accountBalanceAfter) {
			detailString += `. New account balance: ${formatCurrency(
				details.accountBalanceAfter
			)}`;
		}

		return detailString;
	};

	const handleBuyStock = async (stockSymbol, quantity = 1, price) => {
		// Clear previous messages
		setSuccessMessage("");
		setErrorMessage("");

		const result = await stocksService.buyStock(
			stockSymbol,
			quantity,
			price
		);

		if (result.success) {
			const details = formatTransactionDetails(result.details);
			setSuccessMessage(`${result.message} ${details}`);
			setPortfolio(result.portfolio);
		} else {
			setErrorMessage(result.message);
		}
	};

	const handleSellStock = async (stockId, quantity = 1) => {
		// Clear previous messages
		setSuccessMessage("");
		setErrorMessage("");

		const result = await stocksService.sellStock(
			stockId,
			quantity,
			portfolio
		);

		if (result.success) {
			const details = formatTransactionDetails(result.details);
			setSuccessMessage(`${result.message} ${details}`);
			setPortfolio(result.portfolio);
		} else {
			setErrorMessage(result.message);
		}
	};

	const handleAddToWatchlist = async (stockSymbol) => {
		// Clear previous messages
		setSuccessMessage("");
		setErrorMessage("");

		const result = await stocksService.addToWatchlist(
			stockSymbol,
			availableStocks
		);

		if (result.success) {
			setSuccessMessage(result.message);
			setWatchlist(result.watchlist);
		} else {
			setErrorMessage(result.message);
		}
	};

	const handleRemoveFromWatchlist = async (watchlistId) => {
		const result = await stocksService.removeFromWatchlist(watchlistId);

		if (result.success) {
			alert(result.message);
			setWatchlist(result.watchlist);
		} else {
			alert(result.message);
		}
	};

	const handleTestApi = async () => {
		setLoading(true);

		try {
			const result = await stocksService.testApiConnection();

			if (result.success) {
				alert(
					`✅ API Test Successful!\n\nStock: ${
						result.data.symbol
					}\nPrice: $${result.data.price}\nChange: ${
						result.data.change > 0 ? "+" : ""
					}${result.data.change} (${result.data.changePercent}%)`
				);
			} else {
				alert(
					`❌ API Test Failed!\n\n${result.message}\n\nAPI Status: ${
						result.status.alphaVantageConfigured
							? "Configured"
							: "Not Configured"
					}`
				);
			}
		} catch (error) {
			alert(`❌ Test Error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	// Calculate portfolio totals using service
	const portfolioStats = stocksService.calculatePortfolioStats(portfolio, availableStocks);

	// Transform data for components using service
	const transformedPortfolio =
		stocksService.transformPortfolioData(portfolio);
	const transformedWatchlist =
		stocksService.transformWatchlistData(watchlist);

	if (loading) {
		return (
			<div className="container-fluid p-4">
				<div className="row">
					<div className="col-12 text-center">
						<Card>
							<div
								className="spinner-border text-primary mb-3"
								role="status"
							>
								<span className="visually-hidden">
									Loading...
								</span>
							</div>
							<h5>Loading Stock Market Data...</h5>
							<p className="text-muted">
								Connecting to server...
							</p>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container-fluid p-4">
				<div className="row">
					<div className="col-12">
						<div className="alert alert-warning" role="alert">
							<h4 className="alert-heading">
								⚠️ Connection Issue
							</h4>
							<p>{error}</p>
							<hr />
							<p className="mb-0">
								<Button
									variant="primary"
									onClick={loadInitialData}
									loading={loading}
								>
									Retry Connection
								</Button>
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const renderTabContent = () => {
		switch (activeTab) {
			case "market":
				return (
					<StocksList
						stocks={availableStocks}
						onBuyStock={handleBuyStock}
						onAddToWatchlist={handleAddToWatchlist}
						loading={loading}
					/>
				);
			case "portfolio":
				return (
					<Portfolio
						portfolio={transformedPortfolio}
						marketData={availableStocks}
						totalValue={portfolioStats.totalValue}
						totalGain={portfolioStats.totalGain}
						totalGainPercent={portfolioStats.totalGainPercent}
						onSellStock={handleSellStock}
						loading={loading}
					/>
				);
			case "watchlist":
				return (
					<StocksWatchlist
						watchlist={transformedWatchlist}
						marketData={availableStocks}
						onRemoveFromWatchlist={handleRemoveFromWatchlist}
						onBuyStock={handleBuyStock}
						loading={loading}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<>
			<div className="container-fluid p-4">
				<div className="row g-4">
					{/* Success Message */}
					{successMessage && (
						<div className="col-12">
							<div
								className="alert alert-success alert-dismissible fade show"
								role="alert"
							>
								<i className="bi bi-check-circle-fill me-2"></i>
								{successMessage}
								<button
									type="button"
									className="btn-close"
									onClick={() => setSuccessMessage("")}
									aria-label="Close"
								></button>
							</div>
						</div>
					)}

					{/* Error Message */}
					{errorMessage && (
						<div className="col-12">
							<div
								className="alert alert-danger alert-dismissible fade show"
								role="alert"
							>
								<i className="bi bi-exclamation-triangle-fill me-2"></i>
								{errorMessage}
								<button
									type="button"
									className="btn-close"
									onClick={() => setErrorMessage("")}
									aria-label="Close"
								></button>
							</div>
						</div>
					)}

					<StocksHeader
						totalPortfolioValue={portfolioStats.totalValue}
						totalGain={portfolioStats.totalGain}
						totalGainPercent={portfolioStats.totalGainPercent}
						onTestApi={handleTestApi}
						onRefreshPrices={handleRefreshPrices}
					/>

					<StocksTabs
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>

					{renderTabContent()}
				</div>
			</div>
		</>
	);
};

export default Stocks;
