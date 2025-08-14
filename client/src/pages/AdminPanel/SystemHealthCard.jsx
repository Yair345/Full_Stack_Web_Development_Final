import Card from "../../components/ui/Card";
import { getStatusBadge, getHealthColor } from "./adminUtils";

const SystemHealthCard = ({ systemStats, services }) => {
	return (
		<div className="col-lg-8">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h5 className="fw-medium mb-0">System Health</h5>
					<span className="badge bg-success">Operational</span>
				</div>

				<div className="row g-4">
					<div className="col-md-6">
						<div className="text-center">
							<div className="position-relative d-inline-block">
								<div
									className={`bg-${getHealthColor(
										systemStats.systemHealth
									)} rounded-circle d-flex align-items-center justify-content-center`}
									style={{ width: "80px", height: "80px" }}
								>
									<span className="h4 fw-bold text-white mb-0">
										{systemStats.systemHealth}%
									</span>
								</div>
							</div>
							<p className="fw-medium mt-2 mb-0">System Uptime</p>
							<small className="text-muted">Last 30 days</small>
						</div>
					</div>
					<div className="col-md-6">
						<div className="list-group list-group-flush">
							{services.map((service, index) => {
								const statusInfo = getStatusBadge(
									service.status
								);
								return (
									<div
										key={service.name}
										className={`list-group-item d-flex justify-content-between align-items-center px-0 ${
											index === services.length - 1
												? "border-bottom-0"
												: ""
										}`}
									>
										<span>{service.name}</span>
										<span
											className={`badge ${statusInfo.class}`}
										>
											{statusInfo.text}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default SystemHealthCard;
