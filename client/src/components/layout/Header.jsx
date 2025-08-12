import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { logout } from "../../store/slices/authSlice";

const Header = ({ setSidebarOpen }) => {
	const { user } = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleLogout = () => {
		dispatch(logout());
		navigate("/login");
	};

	return (
		<header className="bg-white shadow-sm lg:static lg:overflow-y-visible">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="relative flex justify-between xl:grid xl:grid-cols-12 lg:gap-8">
					<div className="flex md:absolute md:left-0 md:inset-y-0 lg:static xl:col-span-2">
						<div className="flex-shrink-0 flex items-center">
							<button
								type="button"
								className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
								onClick={() => setSidebarOpen(true)}
							>
								<span className="sr-only">Open sidebar</span>
								<Menu className="h-6 w-6" aria-hidden="true" />
							</button>
							<div className="lg:hidden ml-4">
								<h1 className="text-xl font-bold text-blue-600">
									SecureBank
								</h1>
							</div>
						</div>
					</div>

					<div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
						<div className="flex items-center px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
							<div className="w-full">
								<h1 className="text-lg font-medium text-gray-900">
									Welcome back, {user?.firstName || "User"}
								</h1>
							</div>
						</div>
					</div>

					<div className="flex items-center md:absolute md:right-0 md:inset-y-0 lg:hidden xl:col-span-4">
						{/* Mobile menu items */}
					</div>

					<div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
						<button
							type="button"
							className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<span className="sr-only">View notifications</span>
							<Bell className="h-6 w-6" aria-hidden="true" />
						</button>

						{/* Profile dropdown */}
						<div className="flex-shrink-0 relative ml-5">
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
										<User className="h-5 w-5 text-blue-600" />
									</div>
									<span className="text-sm font-medium text-gray-700">
										{user?.firstName} {user?.lastName}
									</span>
								</div>
								<button
									onClick={handleLogout}
									className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									<LogOut className="h-5 w-5" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
