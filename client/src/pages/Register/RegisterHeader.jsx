import { Building2 } from "lucide-react";

const RegisterHeader = () => {
	return (
		<div className="text-center mb-4">
			<div className="d-flex justify-content-center align-items-center mb-3">
				<div
					className="rounded bg-bank-blue d-flex align-items-center justify-content-center me-3"
					style={{
						width: "48px",
						height: "48px",
					}}
				>
					<Building2 size={32} className="text-white" />
				</div>
				<h1 className="h3 fw-bold text-dark mb-0">SecureBank</h1>
			</div>
			<h2 className="h4 fw-bold text-dark mb-2">Create your account</h2>
			<p className="text-muted">
				Join SecureBank and start managing your finances
			</p>
		</div>
	);
};

export default RegisterHeader;
