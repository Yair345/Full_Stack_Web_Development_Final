import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Input } from '../../components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useAuth } from '../../hooks';
import { api } from '../../services/api';
import StockDisplayCommon from './StockDisplayCommon';
import { normalizeStockData } from './stocksUtils';

const Portfolio = () => {
	const [portfolio, setPortfolio] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showSellForm, setShowSellForm] = useState(null);
	const [sellQuantity, setSellQuantity] = useState('');
	const [sellType, setSellType] = useState('limit');
	const [sellPrice, setSellPrice] = useState('');
	const { user } = useAuth();

	const fetchPortfolio = async () => {
		try {
			setLoading(true);
			const response = await api.get('/api/stocks/portfolio');
			setPortfolio(response.data);
		} catch (error) {
			console.error('Error fetching portfolio:', error);
			setError('Error loading portfolio');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPortfolio();
	}, []);

	const handleSellStock = async (stockId) => {
		try {
			const sellData = {
				symbol: portfolio.find(stock => stock.id === stockId).symbol,
				quantity: parseInt(sellQuantity),
				price: sellType === 'limit' ? parseFloat(sellPrice) : null,
				orderType: sellType
			};

			await api.post('/api/stocks/sell', sellData);
			await fetchPortfolio();
			setShowSellForm(null);
			setSellQuantity('');
			setSellPrice('');
		} catch (error) {
			console.error('Error selling stock:', error);
		}
	};

	const getPositionValue = (position) => {
		const currentPrice = position.currentPrice || position.price;
		return position.quantity * currentPrice;
	};

	const getTotalPortfolioValue = () => {
		return portfolio.reduce((total, position) => total + getPositionValue(position), 0);
	};

	const getTotalGainLoss = () => {
		return portfolio.reduce((total, position) => {
			const currentValue = getPositionValue(position);
			const originalValue = position.quantity * position.avgPrice;
			return total + (currentValue - originalValue);
		}, 0);
	};

	const getTotalDailyChange = () => {
		return portfolio.reduce((total, position) => {
			const dailyChange = position.dailyChange || 0;
			return total + (dailyChange * position.quantity);
		}, 0);
	};

	if (loading) return <div className="flex justify-center p-8">Loading portfolio...</div>;
	if (error) return <div className="text-red-500 p-4">{error}</div>;

	const totalValue = getTotalPortfolioValue();
	const totalGainLoss = getTotalGainLoss();
	const totalDailyChange = getTotalDailyChange();
	const gainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
	const dailyChangePercent = totalValue > 0 ? (totalDailyChange / totalValue) * 100 : 0;

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">My Portfolio</h1>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-gray-600">Total Value</div>
							<div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-gray-600">Total Gain/Loss</div>
							<div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
								{totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-gray-600">Daily Change</div>
							<div className={`text-2xl font-bold ${totalDailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
								{totalDailyChange >= 0 ? '+' : ''}${totalDailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%)
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{portfolio.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center">
						<div className="text-gray-500">Your portfolio is empty</div>
						<div className="text-sm text-gray-400 mt-2">Start investing to see your positions here</div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{portfolio.map((position) => {
						const normalizedPosition = normalizeStockData(position);
						const currentValue = getPositionValue(position);
						const totalGain = currentValue - (position.quantity * position.avgPrice);
						const totalGainPercent = ((currentValue / (position.quantity * position.avgPrice)) - 1) * 100;

						return (
							<Card key={position.id} className="border border-gray-200">
								<CardContent className="p-6">
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<div className="flex items-center justify-between mb-4">
												<StockDisplayCommon.StockInfoDisplay
													symbol={normalizedPosition.symbol}
													name={normalizedPosition.name}
												/>
												<StockDisplayCommon.StockPriceDisplay
													currentPrice={normalizedPosition.currentPrice}
													previousClose={normalizedPosition.previousClose}
													priceChange={normalizedPosition.priceChange}
													priceChangePercent={normalizedPosition.priceChangePercent}
												/>
											</div>

											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
												<div>
													<span className="text-gray-600">Quantity:</span>
													<div className="font-semibold">{position.quantity}</div>
												</div>
												<div>
													<span className="text-gray-600">Avg. Price:</span>
													<div className="font-semibold">${position.avgPrice.toFixed(2)}</div>
												</div>
												<div>
													<span className="text-gray-600">Current Value:</span>
													<div className="font-semibold">${currentValue.toFixed(2)}</div>
												</div>
												<div>
													<span className="text-gray-600">Total Gain/Loss:</span>
													<div className={`font-semibold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
														{totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)} ({totalGainPercent.toFixed(2)}%)
													</div>
												</div>
											</div>
										</div>

										<div className="ml-4 flex gap-2">
											<Button
												onClick={() => setShowSellForm(showSellForm === position.id ? null : position.id)}
												variant="outline"
												size="sm"
											>
												<Minus className="h-4 w-4" />
											</Button>
										</div>
									</div>

									{showSellForm === position.id && (
										<div className="mt-4 p-4 bg-gray-50 rounded-lg">
											<h4 className="font-semibold mb-3">Sell {position.symbol}</h4>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<div>
													<label className="block text-sm font-medium mb-1">Quantity</label>
													<Input
														type="number"
														max={position.quantity}
														value={sellQuantity}
														onChange={(e) => setSellQuantity(e.target.value)}
														placeholder="Quantity to sell"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium mb-1">Order Type</label>
													<Select value={sellType} onValueChange={setSellType}>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="market">Market</SelectItem>
															<SelectItem value="limit">Limit</SelectItem>
														</SelectContent>
													</Select>
												</div>
												{sellType === 'limit' && (
													<div>
														<label className="block text-sm font-medium mb-1">Limit Price</label>
														<Input
															type="number"
															step="0.01"
															value={sellPrice}
															onChange={(e) => setSellPrice(e.target.value)}
															placeholder="Sell price"
														/>
													</div>
												)}
											</div>
											<div className="flex gap-2 mt-4">
												<Button
													onClick={() => handleSellStock(position.id)}
													disabled={!sellQuantity || (sellType === 'limit' && !sellPrice)}
													size="sm"
												>
													Confirm Sell
												</Button>
												<Button
													onClick={() => setShowSellForm(null)}
													variant="outline"
													size="sm"
												>
													Cancel
												</Button>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Portfolio;
