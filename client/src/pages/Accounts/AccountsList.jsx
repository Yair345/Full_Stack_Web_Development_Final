import AccountCard from "./AccountCard";

const AccountsList = ({ accounts, loading, error, onAccountDeleted }) => {
	if (loading) {
		return (
			<div className="col-12">
				<div className="text-center py-5">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-3 text-muted">Loading accounts...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="col-12">
				<div className="alert alert-danger" role="alert">
					<h4 className="alert-heading">Error Loading Accounts</h4>
					<p className="mb-0">{error}</p>
				</div>
			</div>
		);
	}

	if (accounts.length === 0) {
		return (
			<div className="col-12">
				<div className="text-center py-5">
					<h5 className="text-muted">No Accounts Found</h5>
					<p className="text-muted">
						You don't have any accounts yet.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="col-12">
			<div className="row g-4">
				{accounts.map((account) => (
					<AccountCard
						key={account.id}
						account={account}
						onAccountDeleted={onAccountDeleted}
					/>
				))}
			</div>
		</div>
	);
};

export default AccountsList;
