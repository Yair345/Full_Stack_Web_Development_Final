import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
	Home,
	CreditCard,
	ArrowLeftRight,
	Send,
	Banknote,
	Settings,
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

	// Add admin/manager specific navigation
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

	function classNames(...classes) {
		return classes.filter(Boolean).join(" ");
	}

	return (
		<div className="flex flex-col flex-grow border-r border-gray-200 pt-5 pb-4 bg-white overflow-y-auto">
			<div className="flex items-center flex-shrink-0 px-4">
				<div className="flex items-center">
					<div className="flex-shrink-0">
						<div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
							<Building2 className="h-5 w-5 text-white" />
						</div>
					</div>
					<div className="ml-3">
						<h1 className="text-xl font-bold text-gray-900">
							SecureBank
						</h1>
					</div>
				</div>
			</div>

			<nav
				className="mt-5 flex-grow flex flex-col divide-y divide-gray-200"
				aria-label="Sidebar"
			>
				<div className="px-2 space-y-1">
					{navigation.map((item) => (
						<NavLink
							key={item.name}
							to={item.href}
							className={({ isActive }) =>
								classNames(
									isActive
										? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
									"group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
								)
							}
						>
							{({ isActive }) => (
								<>
									<item.icon
										className={classNames(
											isActive
												? "text-blue-500"
												: "text-gray-400 group-hover:text-gray-500",
											"mr-3 flex-shrink-0 h-6 w-6"
										)}
										aria-hidden="true"
									/>
									{item.name}
								</>
							)}
						</NavLink>
					))}
				</div>

				{adminNavigation.length > 0 && (
					<div className="mt-6 pt-6">
						<div className="px-2 space-y-1">
							<h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
								Administration
							</h3>
							{adminNavigation.map((item) => (
								<NavLink
									key={item.name}
									to={item.href}
									className={({ isActive }) =>
										classNames(
											isActive
												? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
												: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
											"group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
										)
									}
								>
									{({ isActive }) => (
										<>
											<item.icon
												className={classNames(
													isActive
														? "text-blue-500"
														: "text-gray-400 group-hover:text-gray-500",
													"mr-3 flex-shrink-0 h-6 w-6"
												)}
												aria-hidden="true"
											/>
											{item.name}
										</>
									)}
								</NavLink>
							))}
						</div>
					</div>
				)}
			</nav>

			{/* User info at bottom */}
			<div className="flex-shrink-0 border-t border-gray-200 p-4">
				<div className="flex items-center">
					<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
						<User className="h-4 w-4 text-blue-600" />
					</div>
					<div className="ml-3">
						<p className="text-sm font-medium text-gray-700">
							{user?.firstName} {user?.lastName}
						</p>
						<p className="text-xs text-gray-500 capitalize">
							{user?.role || "User"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
