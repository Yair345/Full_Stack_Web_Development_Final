import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const TokenStatusIndicator = ({ showDetails = false }) => {
	const { token, getTokenExpiry, isTokenExpiringSoon } = useAuth();
	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		if (!token) return;

		const updateTimeLeft = () => {
			const expiry = getTokenExpiry();
			if (!expiry) return;

			const now = Date.now();
			const diff = expiry - now;

			if (diff <= 0) {
				setTimeLeft("Expired");
				return;
			}

			const minutes = Math.floor(diff / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);
			setTimeLeft(`${minutes}m ${seconds}s`);
		};

		updateTimeLeft();
		const interval = setInterval(updateTimeLeft, 1000);

		return () => clearInterval(interval);
	}, [token, getTokenExpiry]);

	if (!token || !showDetails) return null;

	const isExpiring = isTokenExpiringSoon();

	return (
		<div className={`token-status ${isExpiring ? "expiring" : "valid"}`}>
			<span className="token-indicator">{isExpiring ? "⚠️" : "🟢"}</span>
			{showDetails && (
				<span className="time-left">Token expires in: {timeLeft}</span>
			)}
		</div>
	);
};

export default TokenStatusIndicator;
