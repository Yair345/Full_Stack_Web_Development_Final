import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { useAuthInitialization } from "./hooks/useAuthInitialization";
import Layout from "./components/layout/Layout";
import ProtectedRoute, {
	WaitingRoute,
} from "./components/layout/ProtectedRoute";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import WaitingPage from "./pages/Waiting/WaitingPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Accounts from "./pages/Accounts/Accounts.jsx";
import Transactions from "./pages/Transactions/Transactions.jsx";
import Transfer from "./pages/Transfer/Transfer";
import Loans from "./pages/Loans/Loans";
import Cards from "./pages/Cards/Cards";
import AdminPanel from "./pages/AdminPanel/AdminPanel";
import BranchManagement from "./pages/BranchManagement/BranchManagement";
import Profile from "./pages/Profile/Profile";
import Stocks from "./pages/Stocks/Stocks.jsx";

function AppContent() {
	const { loading, isInitialized } = useAuthInitialization();

	return (
		<div className="App">
			{!isInitialized && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg">
						<div className="flex items-center space-x-3">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
							<span>Authenticating...</span>
						</div>
					</div>
				</div>
			)}
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route
					path="/waiting"
					element={
						<WaitingRoute>
							<WaitingPage />
						</WaitingRoute>
					}
				/>
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
										path="/stocks"
										element={<Stocks />}
									/>
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
