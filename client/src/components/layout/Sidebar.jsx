import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
	Home,
	CreditCard,
	ArrowLeftRight,
	Send,
	Banknote,
	Shield,
	Building2,
	User,
	Wallet,
} from "lucide-react";

const Sidebar = () => {
	const { user } = useSelector((state) => state.auth);

	const navigation = [
		{ name: "Dashboard", href: "/dashboard", icon: Home },
		{ name: "Accounts", href: "/accounts", icon: CreditCard },
		{ name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
		{ name: "Transfer", href: "/transfer", icon: Send },
		{ name: "Loans", href: "/loans", icon: Banknote },
		{ name: "Cards", href: "/cards", icon: Wallet },
		{ name: "Profile", href: "/profile", icon: User },
	];

	const adminNavigation = [];
	if (user?.role === "admin") {
		adminNavigation.push({
			name: "Admin Panel",
			href: "/admin",
			icon: Shield,
		});
	}
	if (user?.role === "manager" || user?.role === "admin") {
		adminNavigation.push({
			name: "Branch Management",
			href: "/branch",
			icon: Building2,
		});
	}

	const NavItem = ({ item }) => (
		<NavLink
			to={item.href}
			className={({ isActive }) =>
				`nav-link nav-link-custom d-flex align-items-center py-2 px-3 mb-1 rounded text-decoration-none
				${isActive ? "active" : ""}`
			}
		>
			{({ isActive }) => (
				<>
					<item.icon
						size={20}
						className={`me-3 ${isActive ? "text-bank-blue" : ""}`}
					/>
					{item.name}
				</>
			)}
		</NavLink>
	);

	return (
		<div className="sidebar">
			<div className="sidebar-content">
				{/* Logo - Fixed at top */}
				<div className="d-flex align-items-center p-4 border-bottom flex-shrink-0">
					<div
						className="rounded bg-bank-blue d-flex align-items-center justify-content-center"
						style={{ width: "36px", height: "36px" }}
					>
						<Building2 size={20} className="text-white" />
					</div>
					<h1 className="h5 mb-0 ms-3 fw-bold text-dark">
						SecureBank
					</h1>
				</div>

				{/* Navigation - Scrollable middle section */}
				<div className="sidebar-nav p-3">
					<div className="nav flex-column">
						{navigation.map((item) => (
							<NavItem key={item.name} item={item} />
						))}
					</div>

					{adminNavigation.length > 0 && (
						<div className="mt-4 pt-3 border-top">
							<h6 className="px-3 text-uppercase text-muted small fw-semibold mb-2">
								Administration
							</h6>
							<div className="nav flex-column">
								{adminNavigation.map((item) => (
									<NavItem key={item.name} item={item} />
								))}
							</div>
						</div>
					)}
				</div>

				{/* User info - Fixed at bottom */}
				<div className="sidebar-footer border-top p-3 bg-light">
					<div className="d-flex align-items-center">
						<div
							className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
							style={{ width: "32px", height: "32px" }}
						>
							<User size={16} className="text-primary" />
						</div>
						<div className="ms-3">
							<p className="mb-0 small fw-medium text-dark">
								{user?.firstName} {user?.lastName}
							</p>
							<p
								className="mb-0 text-muted"
								style={{ fontSize: "0.75rem" }}
							>
								{user?.role || "User"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
