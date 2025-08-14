import {
	FileText,
	UserCheck,
	AlertTriangle,
	UserX,
	Activity,
	UserPlus,
	Shield,
	DollarSign,
	Settings,
	LogIn,
	LogOut,
	ArrowUpRight,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getSeverityInfo, getActivityTypeIcon } from "./adminUtils";

const ActivityLogItem = ({ activity, isLast }) => {
	const getSeverityIcon = (severity) => {
		const severityInfo = getSeverityInfo(severity);
		const iconMap = {
			success: UserCheck,
			warning: AlertTriangle,
			error: UserX,
			info: Activity,
		};
		const IconComponent = iconMap[severity] || Activity;

		return (
			<div className={`${severityInfo.class} rounded-circle p-1 me-2`}>
				<IconComponent size={12} className="text-white" />
			</div>
		);
	};

	const getActivityBadgeClass = (severity) => {
		const severityMap = {
			success: "bg-success",
			warning: "bg-warning",
			error: "bg-danger",
			info: "bg-info",
		};
		return severityMap[severity] || "bg-info";
	};

	return (
		<div
			className={`list-group-item d-flex align-items-start py-3 ${
				isLast ? "border-bottom-0" : ""
			}`}
		>
			{getSeverityIcon(activity.severity)}
			<div className="flex-grow-1">
				<p className="mb-1">{activity.description}</p>
				<small className="text-muted">{activity.timestamp}</small>
			</div>
			<span
				className={`badge ms-2 ${getActivityBadgeClass(
					activity.severity
				)}`}
			>
				{activity.type.replace("_", " ")}
			</span>
		</div>
	);
};

const ActivityLogTab = ({ recentActivity, onExportLog }) => {
	return (
		<div className="col-12">
			<Card>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h5 className="fw-medium mb-0">System Activity Log</h5>
					<Button variant="outline" onClick={onExportLog}>
						<FileText size={16} className="me-2" />
						Export Log
					</Button>
				</div>

				<div className="list-group list-group-flush">
					{recentActivity.map((activity, index) => (
						<ActivityLogItem
							key={activity.id}
							activity={activity}
							isLast={index === recentActivity.length - 1}
						/>
					))}
				</div>

				{recentActivity.length === 0 && (
					<div className="text-center py-4">
						<Activity size={48} className="text-muted mb-3" />
						<p className="text-muted">No recent activity</p>
						<p className="small text-muted">
							System activity will appear here as it occurs
						</p>
					</div>
				)}
			</Card>
		</div>
	);
};

export default ActivityLogTab;
