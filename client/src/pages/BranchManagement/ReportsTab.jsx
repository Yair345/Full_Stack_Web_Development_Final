import { FileText, Users, DollarSign, TrendingUp } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const ReportsTab = ({ recentReports, onGenerateReport, onDownloadReport }) => {
	const reportTypes = [
		{
			id: "monthly",
			title: "Monthly Branch Report",
			description: "Customer activity and performance metrics",
			icon: FileText,
		},
		{
			id: "demographics",
			title: "Customer Demographics",
			description: "Age, location, and account type breakdown",
			icon: Users,
		},
		{
			id: "revenue",
			title: "Revenue Analysis",
			description: "Fee income and product performance",
			icon: DollarSign,
		},
		{
			id: "growth",
			title: "Growth Trends",
			description: "Customer acquisition and retention rates",
			icon: TrendingUp,
		},
	];

	return (
		<div className="col-12">
			<div className="row g-4">
				<div className="col-lg-6">
					<Card>
						<h5 className="fw-medium mb-4">Generate Reports</h5>
						<div className="d-grid gap-3">
							{reportTypes.map((report) => {
								const IconComponent = report.icon;
								return (
									<Button
										key={report.id}
										variant="outline"
										className="text-start"
										onClick={() =>
											onGenerateReport(report.id)
										}
									>
										<div className="d-flex align-items-center">
											<IconComponent
												size={20}
												className="me-3"
											/>
											<div>
												<div className="fw-medium">
													{report.title}
												</div>
												<small className="text-muted">
													{report.description}
												</small>
											</div>
										</div>
									</Button>
								);
							})}
						</div>
					</Card>
				</div>

				<div className="col-lg-6">
					<Card>
						<h5 className="fw-medium mb-4">Recent Reports</h5>
						<div className="list-group list-group-flush">
							{recentReports.map((report, index) => (
								<div
									key={report.id}
									className={`list-group-item d-flex justify-content-between align-items-center px-0 ${
										index === recentReports.length - 1
											? "border-bottom-0"
											: ""
									}`}
								>
									<div>
										<div className="fw-medium">
											{report.title}
										</div>
										<small className="text-muted">
											Generated on {report.generatedDate}
										</small>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											onDownloadReport(report.id)
										}
									>
										Download
									</Button>
								</div>
							))}
						</div>

						{recentReports.length === 0 && (
							<div className="text-center py-4">
								<FileText
									size={48}
									className="text-muted mb-3"
								/>
								<p className="text-muted">No recent reports</p>
								<p className="small text-muted">
									Generated reports will appear here for
									download
								</p>
							</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
};

export default ReportsTab;
