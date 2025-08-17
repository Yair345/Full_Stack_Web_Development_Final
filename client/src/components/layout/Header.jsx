import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, User, LogOut, X } from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import TokenStatusIndicator from "../ui/TokenStatusIndicator";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
	const { user } = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleLogout = () => {
		dispatch(logout());
		navigate("/login");
	};

	return (
		<header className="navbar navbar-expand-lg navbar-light bg-white header-custom">
			<div className="container-fluid">
				<div className="d-flex w-100 justify-content-between align-items-center">
					<div className="d-flex align-items-center">
						<button
							type="button"
							className="btn btn-link d-lg-none p-2 text-secondary"
							onClick={() => setSidebarOpen(!sidebarOpen)}
						>
							<span className="visually-hidden">
								{sidebarOpen ? "Close sidebar" : "Open sidebar"}
							</span>
							{sidebarOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
						<div className="d-lg-none ms-3">
							<h1 className="h4 mb-0 text-bank-blue fw-bold">
								SecureBank
							</h1>
						</div>
					</div>

					<div className="d-none d-md-block flex-grow-1">
						<div className="mx-auto" style={{ maxWidth: "768px" }}>
							<h1 className="h5 mb-0 text-dark">
								Welcome back, {user?.firstName || "User"}
							</h1>
						</div>
					</div>

					<div className="d-flex align-items-center">
						<div className="me-3 d-none d-lg-block">
							<TokenStatusIndicator showDetails={true} />
						</div>
						<div className="me-3 d-lg-none">
							<TokenStatusIndicator showDetails={false} />
						</div>

						<button
							type="button"
							className="btn btn-link p-2 text-secondary me-3"
						>
							<span className="visually-hidden">
								View notifications
							</span>
							<Bell size={20} />
						</button>

						<div className="d-flex align-items-center">
							<div className="d-flex align-items-center me-3">
								<div
									className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2"
									style={{ width: "32px", height: "32px" }}
								>
									<User size={16} className="text-primary" />
								</div>
								<span className="small fw-medium text-dark d-none d-sm-inline">
									{user?.firstName} {user?.lastName}
								</span>
							</div>
							<button
								onClick={handleLogout}
								className="btn btn-link p-2 text-secondary"
							>
								<LogOut size={16} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
