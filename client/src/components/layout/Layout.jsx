import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";

const Layout = ({ children }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Mobile menu */}
			<MobileMenu open={sidebarOpen} setOpen={setSidebarOpen} />

			{/* Desktop sidebar */}
			<div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
				<Sidebar />
			</div>

			{/* Main content */}
			<div className="lg:pl-64 flex flex-col flex-1">
				<Header setSidebarOpen={setSidebarOpen} />
				<main className="flex-1">
					<div className="py-6">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							{children}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default Layout;
