import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<>
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
					style={{ zIndex: 1039 }}
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Mobile sidebar */}
			<div
				className={`position-fixed top-0 start-0 h-100 d-lg-none ${
					sidebarOpen ? "show" : ""
				}`}
				style={{
					width: "280px",
					zIndex: 1040,
					transform: sidebarOpen
						? "translateX(0)"
						: "translateX(-100%)",
					transition: "transform 0.3s ease-in-out",
					backgroundColor: "white",
					borderRight: "1px solid rgba(0, 0, 0, 0.125)",
					boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
				}}
			>
				<Sidebar />
			</div>

			<div className="container-fluid p-0 vh-100 overflow-hidden">
				<div className="row g-0 h-100">
					{/* Desktop sidebar */}
					<div className="d-none d-lg-block col-lg-3 col-xl-2">
						<div className="sidebar">
							<Sidebar />
						</div>
					</div>

					{/* Main content */}
					<div className="col-12 col-lg-9 col-xl-10 d-flex flex-column h-100 overflow-hidden">
						{/* Header */}
						<Header
							sidebarOpen={sidebarOpen}
							setSidebarOpen={setSidebarOpen}
						/>

						{/* Page content */}
						<main
							className="flex-grow-1 p-4"
							style={{ overflowY: "auto", height: "0" }}
						>
							<div className="container-fluid">{children}</div>
						</main>
					</div>
				</div>
			</div>
		</>
	);
};

export default Layout;
