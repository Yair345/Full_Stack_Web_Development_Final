import Card from "../../components/ui/Card";
import { getStatusBadge, getUsageColor } from "./adminUtils";

const SystemHealthTab = ({ services, performanceMetrics }) => {
	return (
		<div className="col-12">
			<div className="row g-4">
				<div className="col-lg-6">
					<Card>
						<h5 className="fw-medium mb-4">Server Status</h5>
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
										<div className="d-flex align-items-center gap-2">
											<small className="text-muted">
												{service.health}%
											</small>
											<span
												className={`badge ${statusInfo.class}`}
											>
												{statusInfo.text}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</Card>
				</div>

				<div className="col-lg-6">
					<Card>
						<h5 className="fw-medium mb-4">Performance Metrics</h5>
						<div className="list-group list-group-flush">
							{Object.entries(performanceMetrics).map(
								([key, value], index, array) => {
									const label = key
										.replace(/([A-Z])/g, " $1")
										.replace(/^./, (str) =>
											str.toUpperCase()
										);
									const color = getUsageColor(value);

									return (
										<div
											key={key}
											className={`list-group-item px-0 ${
												index === array.length - 1
													? "border-bottom-0"
													: ""
											}`}
										>
											<div className="d-flex justify-content-between align-items-center mb-2">
												<span>{label}</span>
												<span
													className={`fw-medium text-${color}`}
												>
													{value}%
												</span>
											</div>
											<div
												className="progress"
												style={{ height: "6px" }}
											>
												<div
													className={`progress-bar bg-${color}`}
													style={{
														width: `${value}%`,
													}}
												></div>
											</div>
										</div>
									);
								}
							)}
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default SystemHealthTab;
