import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { store } from "./store";
import { setUser } from "./store/slices/authSlice";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Dashboard from "./pages/Dashboard/Dashboard";
import Accounts from "./pages/Accounts/Accounts.jsx";
import Transactions from "./pages/Transactions/Transactions.jsx";
import Transfer from "./pages/Transfer/Transfer";
import Loans from "./pages/Loans/Loans";
import Cards from "./pages/Cards/Cards";
import AdminPanel from "./pages/AdminPanel/AdminPanel";
import BranchManagement from "./pages/BranchManagement/BranchManagement";
import Profile from "./pages/Profile/Profile";

function AppContent() {
	const dispatch = useDispatch();
	const { token, user } = useSelector((state) => state.auth);

	useEffect(() => {
		// If we have a token but no user, initialize with a mock user for testing
		if (token && !user) {
			const mockUser = {
				id: 1,
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				role: "customer",
			};
			dispatch(setUser(mockUser));
		}
	}, [token, user, dispatch]);

	return (
		<div className="App">
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route
					path="/*"
					element={
						<ProtectedRoute>
							<Layout>
								<Routes>
									<Route
										path="/"
										element={
											<Navigate to="/dashboard" replace />
										}
									/>
									<Route
										path="/dashboard"
										element={<Dashboard />}
									/>
									<Route
										path="/accounts"
										element={<Accounts />}
									/>
									<Route
										path="/transactions"
										element={<Transactions />}
									/>
									<Route
										path="/transfer"
										element={<Transfer />}
									/>
									<Route path="/loans" element={<Loans />} />
									<Route path="/cards" element={<Cards />} />
									<Route
										path="/profile"
										element={<Profile />}
									/>
									<Route
										path="/admin"
										element={<AdminPanel />}
									/>
									<Route
										path="/branch"
										element={<BranchManagement />}
									/>
								</Routes>
							</Layout>
						</ProtectedRoute>
					}
				/>
			</Routes>
		</div>
	);
}

function App() {
	return (
		<Provider store={store}>
			<Router>
				<AppContent />
			</Router>
		</Provider>
	);
}

export default App;
