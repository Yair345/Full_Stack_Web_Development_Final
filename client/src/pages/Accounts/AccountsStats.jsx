import { DollarSign, TrendingUp, CreditCard } from "lucide-react";
import Card from "../../components/ui/Card";
import { formatCurrency } from "../../utils/helpers";

const AccountsStats = ({ accounts }) => {
	// Calculate account statistics
	const getAccountStats = () => {
		if (!accounts || accounts.length === 0) {
			return {
				totalBalance: 0,
				totalAccounts: 0,
				activeAccounts: 0,
				totalAvailable: 0,
			};
		}

		return accounts.reduce(
			(acc, account) => {
				acc.totalBalance += account.balance || 0;
				acc.totalAccounts += 1;

				if (account.status === "active") {
					acc.activeAccounts += 1;
				}

				// Calculate available balance (including overdraft for checking accounts)
				if (account.type === "checking" && account.limit) {
					acc.totalAvailable +=
						(account.balance || 0) + (account.limit || 0);
				} else {
					acc.totalAvailable += account.balance || 0;
				}

				return acc;
			},
			{
				totalBalance: 0,
				totalAccounts: 0,
				activeAccounts: 0,
				totalAvailable: 0,
			}
		);
	};

	const stats = getAccountStats();

	// Don't render anything if there are no accounts
	if (!accounts || accounts.length === 0) {
		return null;
	}

	return (
		<div className="col-12 mb-4">
			<div className="row g-3">
				<div className="col-md-3">
					<Card className="text-center">
						<div className="d-flex align-items-center justify-content-center mb-2">
							<DollarSign
								className="text-primary me-2"
								size={24}
							/>
							<h6 className="mb-0 text-muted">Total Balance</h6>
						</div>
						<h4 className="fw-bold text-dark mb-0">
							{formatCurrency(stats.totalBalance)}
						</h4>
					</Card>
				</div>

				<div className="col-md-3">
					<Card className="text-center">
						<div className="d-flex align-items-center justify-content-center mb-2">
							<TrendingUp
								className="text-success me-2"
								size={24}
							/>
							<h6 className="mb-0 text-muted">Available</h6>
						</div>
						<h4 className="fw-bold text-success mb-0">
							{formatCurrency(stats.totalAvailable)}
						</h4>
					</Card>
				</div>

				<div className="col-md-3">
					<Card className="text-center">
						<div className="d-flex align-items-center justify-content-center mb-2">
							<CreditCard className="text-info me-2" size={24} />
							<h6 className="mb-0 text-muted">Accounts</h6>
						</div>
						<h4 className="fw-bold text-dark mb-0">
							{stats.totalAccounts}
						</h4>
						<small className="text-muted">
							{stats.activeAccounts} active
						</small>
					</Card>
				</div>

				<div className="col-md-3">
					<Card className="text-center">
						<div className="d-flex align-items-center justify-content-center mb-2">
							<div
								className={`rounded-circle p-2 me-2 ${
									stats.activeAccounts === stats.totalAccounts
										? "bg-success-subtle"
										: "bg-warning-subtle"
								}`}
							>
								<div
									className={`rounded-circle ${
										stats.activeAccounts ===
										stats.totalAccounts
											? "bg-success"
											: "bg-warning"
									}`}
									style={{ width: "12px", height: "12px" }}
								></div>
							</div>
							<h6 className="mb-0 text-muted">Status</h6>
						</div>
						<h6
							className={`fw-bold mb-0 ${
								stats.activeAccounts === stats.totalAccounts
									? "text-success"
									: "text-warning"
							}`}
						>
							{stats.activeAccounts === stats.totalAccounts
								? "All Active"
								: "Some Inactive"}
						</h6>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default AccountsStats;
