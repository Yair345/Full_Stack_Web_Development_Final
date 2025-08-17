import { Plus, User, Clock, RefreshCw } from "lucide-react";
import Button from "../../components/ui/Button";

const AccountsHeader = ({ 
	onOpenNewAccount, 
	onRefresh, 
	userInfo, 
	isRefreshing = false,
	lastRefresh = null
}) => {
	const getCurrentGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	const getLastLoginTime = () => {
		if (!userInfo?.lastLogin) return null;
		
		const lastLogin = new Date(userInfo.lastLogin);
		const now = new Date();
		const diffHours = Math.floor((now - lastLogin) / (1000 * 60 * 60));
		
		if (diffHours < 1) return "Less than an hour ago";
		if (diffHours === 1) return "1 hour ago";
		if (diffHours < 24) return `${diffHours} hours ago`;
		
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays === 1) return "1 day ago";
		return `${diffDays} days ago`;
	};

	const getLastRefreshTime = () => {
		if (!lastRefresh) return null;
		
		const now = new Date();
		const diffMs = now - lastRefresh;
		const diffMinutes = Math.floor(diffMs / 60000);
		
		if (diffMinutes < 1) return 'Just now';
		if (diffMinutes === 1) return '1 minute ago';
		if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
		
		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours === 1) return '1 hour ago';
		if (diffHours < 24) return `${diffHours} hours ago`;
		
		return lastRefresh.toLocaleDateString();
	};

	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center">
				<div>
					<div className="d-flex align-items-center mb-2">
						<User size={24} className="text-primary me-2" />
						<span className="text-muted">
							{getCurrentGreeting()}{userInfo?.name && `, ${userInfo.name}`}
						</span>
					</div>
					<h1 className="h2 fw-bold text-dark mb-1">My Accounts</h1>
					<div className="d-flex align-items-center text-muted mb-0">
						<span className="me-3">Manage your bank accounts and view balances</span>
						<div className="d-flex align-items-center small gap-3">
							{getLastLoginTime() && (
								<div className="d-flex align-items-center">
									<Clock size={14} className="me-1" />
									<span>Last login: {getLastLoginTime()}</span>
								</div>
							)}
							{getLastRefreshTime() && (
								<div className="d-flex align-items-center">
									<RefreshCw size={14} className="me-1" />
									<span>Updated: {getLastRefreshTime()}</span>
								</div>
							)}
						</div>
					</div>
				</div>
				<div className="d-flex gap-2">
					<Button
						variant="outline"
						className="d-flex align-items-center"
						onClick={onRefresh}
						disabled={isRefreshing}
					>
						<RefreshCw 
							size={16} 
							className={`me-2 ${isRefreshing ? 'animate-spin' : ''}`} 
						/>
						{isRefreshing ? 'Refreshing...' : 'Refresh'}
					</Button>
					<Button
						variant="primary"
						className="d-flex align-items-center"
						onClick={onOpenNewAccount}
					>
						<Plus size={20} className="me-2" />
						Open New Account
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AccountsHeader;
