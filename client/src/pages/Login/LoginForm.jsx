import { Eye, EyeOff } from "lucide-react";
import Input from "../../components/ui/Input";

const LoginForm = ({
	formData,
	showPassword,
	loading,
	error,
	onFormChange,
	onPasswordToggle,
	onSubmit,
}) => {
	return (
		<form onSubmit={onSubmit}>
			<Input
				id="email"
				name="email"
				type="email"
				label="Email address"
				autoComplete="email"
				required
				placeholder="Email address"
				value={formData.email}
				onChange={onFormChange}
			/>

			<div className="mb-3">
				<label htmlFor="password" className="form-label">
					Password
				</label>
				<div className="input-group">
					<input
						id="password"
						name="password"
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						required
						className="form-control"
						placeholder="Password"
						value={formData.password}
						onChange={onFormChange}
					/>
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={onPasswordToggle}
					>
						{showPassword ? (
							<EyeOff size={16} />
						) : (
							<Eye size={16} />
						)}
					</button>
				</div>
			</div>

			{error && (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			)}

			<div className="d-grid mb-3">
				<button
					type="submit"
					disabled={loading}
					className="btn btn-bank-primary"
				>
					{loading ? (
						<>
							<span
								className="spinner-border spinner-border-sm me-2"
								role="status"
								aria-hidden="true"
							></span>
							Signing in...
						</>
					) : (
						"Sign in"
					)}
				</button>
			</div>
		</form>
	);
};

export default LoginForm;
