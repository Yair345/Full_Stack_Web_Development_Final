import Card from "../components/ui/Card";

const Transfer = () => {
	return (
		<div className="row g-4">
			<div className="col-12">
				<div>
					<h1 className="h2 fw-bold text-dark mb-1">
						Transfer Money
					</h1>
					<p className="text-muted">
						Send money between accounts or to other recipients
					</p>
				</div>
			</div>

			<div className="col-12">
				<Card>
					<div className="text-center py-5">
						<h3 className="h5 fw-medium text-dark mb-3">
							Money Transfer
						</h3>
						<p className="text-muted mb-4">
							This feature is coming soon
						</p>
						<div className="list-unstyled">
							<li className="small text-muted mb-2">
								• Transfer between your accounts
							</li>
							<li className="small text-muted mb-2">
								• Send to other bank customers
							</li>
							<li className="small text-muted mb-2">
								• Schedule recurring transfers
							</li>
							<li className="small text-muted mb-2">
								• International wire transfers
							</li>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default Transfer;
