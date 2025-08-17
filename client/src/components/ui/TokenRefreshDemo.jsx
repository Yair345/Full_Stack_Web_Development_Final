import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
	createMockToken,
	getTimeRemaining,
	decodeToken,
} from "../../utils/tokenUtils";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";

const TokenRefreshDemo = () => {
	const { token, isTokenExpiringSoon, refreshToken } = useAuth();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const dispatch = useDispatch();

	const handleCreateMockToken = (expiryMinutes) => {
		const mockToken = createMockToken(expiryMinutes);
		const mockRefreshToken = createMockToken(60); // 1 hour refresh token

		// Simulate login with mock tokens
		dispatch(
			loginSuccess({
				user: {
					id: "test-user",
					firstName: "Test",
					lastName: "User",
					email: "test@example.com",
				},
				token: mockToken,
				refreshToken: mockRefreshToken,
			})
		);
	};

	const handleRefreshToken = async () => {
		setIsRefreshing(true);
		try {
			await refreshToken();
		} catch (error) {
			console.error("Manual refresh failed:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const tokenPayload = token ? decodeToken(token) : null;
	const timeRemaining = token ? getTimeRemaining(token) : "No token";

	return (
		<div className="card">
			<div className="card-header">
				<h5 className="card-title mb-0">Token Refresh Demo</h5>
			</div>
			<div className="card-body">
				<div className="row">
					<div className="col-md-6">
						<h6>Current Token Status</h6>
						<div className="mb-3">
							<strong>Time Remaining:</strong>
							<span
								className={`ms-2 ${
									isTokenExpiringSoon()
										? "text-warning"
										: "text-success"
								}`}
							>
								{timeRemaining}
							</span>
						</div>

						{tokenPayload && (
							<div className="mb-3">
								<strong>Token Info:</strong>
								<ul className="list-unstyled small mt-2">
									<li>Subject: {tokenPayload.sub}</li>
									<li>
										Issued:{" "}
										{new Date(
											tokenPayload.iat * 1000
										).toLocaleString()}
									</li>
									<li>
										Expires:{" "}
										{new Date(
											tokenPayload.exp * 1000
										).toLocaleString()}
									</li>
								</ul>
							</div>
						)}

						<div className="mb-3">
							<strong>Status:</strong>
							<span
								className={`ms-2 badge ${
									isTokenExpiringSoon()
										? "bg-warning"
										: "bg-success"
								}`}
							>
								{isTokenExpiringSoon()
									? "Expiring Soon"
									: "Valid"}
							</span>
						</div>
					</div>

					<div className="col-md-6">
						<h6>Test Actions</h6>
						<div className="d-grid gap-2">
							<button
								className="btn btn-secondary btn-sm"
								onClick={() => handleCreateMockToken(15)}
							>
								Create 15-minute Token
							</button>

							<button
								className="btn btn-warning btn-sm"
								onClick={() => handleCreateMockToken(2)}
							>
								Create 2-minute Token (for testing)
							</button>

							<button
								className="btn btn-danger btn-sm"
								onClick={() => handleCreateMockToken(0.5)}
							>
								Create 30-second Token (expires soon)
							</button>

							<button
								className="btn btn-primary btn-sm"
								onClick={handleRefreshToken}
								disabled={isRefreshing || !token}
							>
								{isRefreshing
									? "Refreshing..."
									: "Manual Refresh"}
							</button>
						</div>
					</div>
				</div>

				<div className="mt-4">
					<div className="alert alert-info">
						<strong>How it works:</strong>
						<ul className="mb-0 mt-2">
							<li>
								The system automatically checks token expiry
								every 5 minutes
							</li>
							<li>
								When a token has less than 2 minutes remaining,
								it triggers refresh
							</li>
							<li>
								If automatic refresh fails, an alert prompts the
								user to refresh manually
							</li>
							<li>
								API calls with expired tokens automatically
								trigger refresh attempts
							</li>
							<li>
								The token status indicator in the header shows
								current status
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TokenRefreshDemo;
