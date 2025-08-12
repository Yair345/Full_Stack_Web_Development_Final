import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Transfer from "./pages/Transfer";
import Loans from "./pages/Loans";
import Cards from "./pages/Cards";
import AdminPanel from "./pages/AdminPanel";
import BranchManagement from "./pages/BranchManagement";
import Profile from "./pages/Profile";

function App() {
	return (
		<Provider store={store}>
			<Router>
				<div className="App">
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route
							path="/*"
							element={
								<ProtectedRoute>
									<Layout>
										<Routes>
											<Route
												path="/"
												element={
													<Navigate
														to="/dashboard"
														replace
													/>
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
											<Route
												path="/loans"
												element={<Loans />}
											/>
											<Route
												path="/cards"
												element={<Cards />}
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
			</Router>
		</Provider>
	);
}

export default App;
