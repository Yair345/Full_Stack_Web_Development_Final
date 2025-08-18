import { TrendingUp, TrendingDown, DollarSign, Wifi } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const StocksHeader = ({
	totalPortfolioValue,
	totalGain,
	totalGainPercent,
	onTestApi,
}) => {
	const isGainPositive = totalGain >= 0;

	return (
		<div className="col-12">
			<div className="row g-4">
				{/* Main Header */}
				<div className="col-md-8">
					<div className="bg-primary rounded-3 p-4 text-white">
						<div className="d-flex justify-content-between align-items-start mb-2">
							<div>
								<h1 className="h3 mb-2 fw-bold">
									📈 Stock Market
								</h1>
								<p className="mb-0">
									Buy and sell stocks, manage your portfolio,
									and track your investments
								</p>
							</div>
							{onTestApi && (
								<Button
									variant="outline"
									size="sm"
									onClick={onTestApi}
									className="text-white border-white"
								>
									<Wifi size={16} className="me-1" />
									Test API
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Portfolio Summary Cards */}
				<div className="col-md-4">
					<div className="row g-3">
						{/* Total Portfolio Value */}
						<div className="col-12">
							<Card className="h-100">
								<div className="d-flex align-items-center">
									<div className="rounded bg-primary bg-opacity-10 p-2 me-3">
										<DollarSign
											size={20}
											className="text-primary"
										/>
									</div>
									<div>
										<p className="text-muted small mb-1">
											Portfolio Value
										</p>
										<h5 className="mb-0 fw-bold">
											$
											{totalPortfolioValue.toLocaleString()}
										</h5>
									</div>
								</div>
							</Card>
						</div>

						{/* Total Gain/Loss */}
						<div className="col-12">
							<Card className="h-100">
								<div className="d-flex align-items-center">
									<div
										className={`rounded p-2 me-3 ${
											isGainPositive
												? "bg-success bg-opacity-10"
												: "bg-danger bg-opacity-10"
										}`}
									>
										{isGainPositive ? (
											<TrendingUp
												size={20}
												className="text-success"
											/>
										) : (
											<TrendingDown
												size={20}
												className="text-danger"
											/>
										)}
									</div>
									<div>
										<p className="text-muted small mb-1">
											Total Gain/Loss
										</p>
										<h6
											className={`mb-0 fw-bold ${
												isGainPositive
													? "text-success"
													: "text-danger"
											}`}
										>
											{isGainPositive ? "+" : ""}$
											{totalGain.toLocaleString()}
											<span className="small ms-1">
												({isGainPositive ? "+" : ""}
												{totalGainPercent.toFixed(2)}%)
											</span>
										</h6>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StocksHeader;
