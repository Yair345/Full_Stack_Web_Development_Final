import LoanItem from "./LoanItem";

const LoansList = ({ loans, onMakePayment, onViewDetails }) => {
	if (!loans.length) {
		return (
			<div className="col-12">
				<div className="text-center py-5">
					<div className="text-muted">
						<div className="mb-3">
							<i
								className="bi bi-bank"
								style={{ fontSize: "3rem" }}
							></i>
						</div>
						<h5>No Active Loans</h5>
						<p>
							You don't have any active loans. Apply for a loan to
							get started.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{loans.map((loan) => (
				<div key={loan.id} className="col-lg-6">
					<LoanItem
						loan={loan}
						onMakePayment={onMakePayment}
						onViewDetails={onViewDetails}
					/>
				</div>
			))}
		</>
	);
};

export default LoansList;
