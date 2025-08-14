import { useSelector } from "react-redux";

const DashboardHeader = () => {
	const { user } = useSelector((state) => state.auth);

	return (
		<div className="col-12">
			<div className="bg-gradient-primary rounded p-4 text-white">
				<h1 className="h3 fw-bold mb-2">
					Welcome back, {user?.firstName}!
				</h1>
				<p className="mb-0 opacity-75">
					Here's an overview of your accounts and recent activity.
				</p>
			</div>
		</div>
	);
};

export default DashboardHeader;
