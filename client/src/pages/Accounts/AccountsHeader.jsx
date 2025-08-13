import { Plus } from "lucide-react";
import Button from "../../components/ui/Button";

const AccountsHeader = ({ onOpenNewAccount }) => {
	return (
		<div className="col-12">
			<div className="d-flex justify-content-between align-items-center">
				<div>
					<h1 className="h2 fw-bold text-dark mb-1">My Accounts</h1>
					<p className="text-muted mb-0">
						Manage your bank accounts and view balances
					</p>
				</div>
				<Button
					variant="primary"
					className="d-flex align-items-center"
					onClick={onOpenNewAccount}
				>
					<Plus size={20} className="me-2" />
					Open New Account
				</Button>
			</div>
		</div>
	);
};

export default AccountsHeader;
