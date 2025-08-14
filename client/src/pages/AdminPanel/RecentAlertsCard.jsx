import { AlertTriangle, Shield, Database } from "lucide-react";
import Card from "../../components/ui/Card";

const RecentAlertsCard = ({ alerts, alertsCount }) => {
	const getAlertIcon = (type) => {
		switch (type) {
			case "volume":
				return (
					<AlertTriangle size={16} className="text-warning me-2" />
				);
			case "security":
				return <Shield size={16} className="text-info me-2" />;
			case "backup":
				return <Database size={16} className="text-success me-2" />;
			default:
				return (
					<AlertTriangle size={16} className="text-secondary me-2" />
				);
		}
	};

	return (
		<div className="col-lg-4">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-3">
					<h6 className="fw-medium mb-0">Recent Alerts</h6>
					<span className="badge bg-warning">{alertsCount}</span>
				</div>
				<div className="list-group list-group-flush">
					{alerts.map((alert, index) => (
						<div
							key={alert.id}
							className={`list-group-item d-flex align-items-center px-0 ${
								index === alerts.length - 1
									? "border-bottom-0"
									: ""
							}`}
						>
							{getAlertIcon(alert.type)}
							<div className="flex-grow-1">
								<small className="fw-medium d-block">
									{alert.title}
								</small>
								<small className="text-muted">
									{alert.timestamp}
								</small>
							</div>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
};

export default RecentAlertsCard;
