import { useState, useEffect } from "react";
import {
	Search,
	DollarSign,
	User,
	CreditCard,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import {
	useCreateBranchDeposit,
	useBranchCustomers,
} from "../../hooks/api/apiHooks";
import { useAuth } from "../../hooks";

const CashDepositTab = ({ branchId, onNotification }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [depositAmount, setDepositAmount] = useState("");
	const [description, setDescription] = useState("");
	const [showSearchResults, setShowSearchResults] = useState(false);

	const { user } = useAuth();

	const { mutate: createBranchDeposit, loading: depositLoading } =
		useCreateBranchDeposit();

	// Fetch branch customers with search - only when we have a search term
	const searchParams =
		searchTerm.length >= 3 ? { search: searchTerm, limit: 10 } : {};
	const shouldFetch = searchTerm.length >= 3;

	const {
		data: customersResponse,
		loading: searchLoading,
		refetch: searchCustomers,
	} = useBranchCustomers(shouldFetch ? branchId : null, searchParams);

	const searchResults = customersResponse?.data?.customers || [];

	useEffect(() => {
		if (searchTerm.length >= 3) {
			setShowSearchResults(true);
			// The hook will automatically refetch when searchTerm changes
		} else {
			setShowSearchResults(false);
		}
	}, [searchTerm]);

	const handleSearchChange = (e) => {
		const value = e.target.value;
		setSearchTerm(value);
	};

	const selectCustomer = (customer) => {
		setSelectedCustomer(customer);
		setSearchTerm(customer.first_name + " " + customer.last_name);
		setShowSearchResults(false);
	};

	const handleDeposit = async (accountId) => {
		if (!depositAmount || parseFloat(depositAmount) <= 0) {
			onNotification?.("danger", "Please enter a valid deposit amount");
			return;
		}

		if (!accountId) {
			onNotification?.("danger", "Invalid account selected");
			return;
		}

		try {
			const depositData = {
				account_id: accountId,
				amount: parseFloat(depositAmount),
				description:
					description ||
					`Cash deposit - Branch Manager: ${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
			};

			const result = await createBranchDeposit({ branchId, depositData });


			onNotification?.(
				"success",
				`Cash deposit of $${parseFloat(depositAmount).toFixed(
					2
				)} has been successfully processed for ${
					selectedCustomer.first_name
				} ${selectedCustomer.last_name}`
			);

			// Reset form
			setSelectedCustomer(null);
			setDepositAmount("");
			setDescription("");
			setSearchTerm("");
		} catch (error) {
			console.error("Branch deposit failed:", error);
			console.error("Error details:", {
				message: error.message,
				branchId,
				accountId,
				customer: selectedCustomer?.username,
				amount: depositAmount,
			});

			let errorMessage = "An error occurred while processing the deposit";
			if (error.message?.includes("Account not found")) {
				errorMessage =
					"The selected account is not accessible. Please try selecting a different account or contact support.";
			} else if (error.message?.includes("Insufficient")) {
				errorMessage =
					"Insufficient permissions or account balance issue.";
			} else if (error.message) {
				errorMessage = error.message;
			}

			onNotification?.("danger", `Deposit failed: ${errorMessage}`);
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const getCustomerName = (customer) => {
		return (
			`${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
			customer.username ||
			"Unknown"
		);
	};

	return (
		<div className="col-12">
			<div className="card shadow-sm">
				<div className="card-header bg-primary text-white">
					<div className="d-flex align-items-center">
						<DollarSign size={20} className="me-2" />
						<h5 className="mb-0">Cash Deposit Processing</h5>
					</div>
				</div>
				<div className="card-body">
					{!selectedCustomer ? (
						<div>
							<div className="mb-4">
								<label className="form-label fw-bold">
									<Search size={16} className="me-2" />
									Search Customer
								</label>
								<div className="position-relative">
									<input
										type="text"
										className="form-control form-control-lg"
										placeholder="Search by name, email, username..."
										value={searchTerm}
										onChange={handleSearchChange}
										autoFocus
									/>
									{searchLoading && (
										<div className="position-absolute end-0 top-50 translate-middle-y me-3">
											<div
												className="spinner-border spinner-border-sm"
												role="status"
											>
												<span className="visually-hidden">
													Searching...
												</span>
											</div>
										</div>
									)}
								</div>
								<small className="text-muted">
									Enter at least 3 characters to search for
									customers
								</small>
							</div>

							{showSearchResults && searchResults.length > 0 && (
								<div className="card bg-light">
									<div className="card-header">
										<h6 className="mb-0">
											Search Results (
											{searchResults.length})
										</h6>
									</div>
									<div
										className="list-group list-group-flush"
										style={{
											maxHeight: "400px",
											overflowY: "auto",
										}}
									>
										{searchResults.map((customer) => (
											<button
												key={customer.id}
												className="list-group-item list-group-item-action"
												onClick={() =>
													selectCustomer(customer)
												}
											>
												<div className="d-flex justify-content-between align-items-start">
													<div className="w-100">
														<div className="d-flex align-items-center mb-2">
															<User
																size={16}
																className="me-2 text-primary"
															/>
															<strong>
																{getCustomerName(
																	customer
																)}
															</strong>
														</div>
														<div className="text-muted small">
															<div>
																{customer.email}
															</div>
															<div>
																{customer.phone ||
																	"No phone"}
															</div>
															<div>
																Username:{" "}
																{
																	customer.username
																}
															</div>
														</div>
														{customer.accounts &&
															customer.accounts
																.length > 0 && (
																<div className="mt-2">
																	<strong>
																		Accounts
																		(
																		{
																			customer
																				.accounts
																				.length
																		}
																		):
																	</strong>
																	<div className="mt-1">
																		{customer.accounts.map(
																			(
																				account
																			) => (
																				<div
																					key={
																						account.id
																					}
																					className="badge bg-secondary me-1 mt-1"
																				>
																					{account.account_type
																						.charAt(
																							0
																						)
																						.toUpperCase() +
																						account.account_type.slice(
																							1
																						)}
																					:
																					****
																					{account.account_number.slice(
																						-4
																					)}

																					(
																					{formatCurrency(
																						account.balance ||
																							0
																					)}
																					)
																				</div>
																			)
																		)}
																	</div>
																</div>
															)}
													</div>
												</div>
											</button>
										))}
									</div>
								</div>
							)}

							{showSearchResults &&
								searchTerm.length >= 3 &&
								searchResults.length === 0 &&
								!searchLoading && (
									<div className="alert alert-warning">
										<AlertCircle
											size={16}
											className="me-2"
										/>
										No customers found matching "
										{searchTerm}". Please verify the search
										criteria.
									</div>
								)}
						</div>
					) : (
						<div>
							{/* Selected Customer Info */}
							<div className="card bg-light mb-4">
								<div className="card-header d-flex justify-content-between align-items-center">
									<h6 className="mb-0">Selected Customer</h6>
									<button
										className="btn btn-sm btn-outline-secondary"
										onClick={() => {
											setSelectedCustomer(null);
											setSearchTerm("");
											setDepositAmount("");
											setDescription("");
										}}
									>
										Change Customer
									</button>
								</div>
								<div className="card-body">
									<div className="row">
										<div className="col-md-6">
											<div className="d-flex align-items-center mb-2">
												<User
													size={16}
													className="me-2 text-primary"
												/>
												<strong>
													{getCustomerName(
														selectedCustomer
													)}
												</strong>
											</div>
											<div className="text-muted small">
												<div>
													{selectedCustomer.email}
												</div>
												<div>
													{selectedCustomer.phone ||
														"No phone"}
												</div>
												<div>
													Username:{" "}
													{selectedCustomer.username}
												</div>
											</div>
										</div>
										<div className="col-md-6">
											{selectedCustomer.accounts &&
											selectedCustomer.accounts.length >
												0 ? (
												<>
													<strong>
														Available Accounts:
													</strong>
													<div className="mt-2">
														{selectedCustomer.accounts.map(
															(account) => (
																<div
																	key={
																		account.id
																	}
																	className="badge bg-info me-1 mt-1"
																>
																	{account.account_type
																		.charAt(
																			0
																		)
																		.toUpperCase() +
																		account.account_type.slice(
																			1
																		)}
																	: ****
																	{account.account_number.slice(
																		-4
																	)}
																	(
																	{formatCurrency(
																		account.balance ||
																			0
																	)}
																	)
																</div>
															)
														)}
													</div>
												</>
											) : (
												<div className="text-warning">
													<AlertCircle
														size={16}
														className="me-2"
													/>
													No active accounts found for
													this customer.
												</div>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Deposit Form */}
							{selectedCustomer.accounts &&
							selectedCustomer.accounts.length > 0 ? (
								<form onSubmit={(e) => e.preventDefault()}>
									<div className="row">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label fw-bold">
													<DollarSign
														size={16}
														className="me-2"
													/>
													Deposit Amount
												</label>
												<div className="input-group input-group-lg">
													<span className="input-group-text">
														$
													</span>
													<input
														type="number"
														className="form-control"
														placeholder="0.00"
														step="0.01"
														min="0.01"
														value={depositAmount}
														onChange={(e) =>
															setDepositAmount(
																e.target.value
															)
														}
														required
													/>
												</div>
												<small className="text-muted">
													Enter the cash amount to
													deposit
												</small>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label fw-bold">
													Description (Optional)
												</label>
												<input
													type="text"
													className="form-control"
													placeholder="e.g., Cash deposit from customer"
													value={description}
													onChange={(e) =>
														setDescription(
															e.target.value
														)
													}
												/>
												<small className="text-muted">
													Add a note for this
													transaction
												</small>
											</div>
										</div>
									</div>

									<div className="mb-4">
										<h6 className="fw-bold">
											Select Account for Deposit:
										</h6>
										<div className="row">
											{selectedCustomer.accounts.map(
												(account) => (
													<div
														key={account.id}
														className="col-md-6 mb-3"
													>
														<div className="card border-primary">
															<div className="card-body">
																<div className="d-flex align-items-center mb-2">
																	<CreditCard
																		size={
																			16
																		}
																		className="me-2 text-primary"
																	/>
																	<strong className="text-capitalize">
																		{
																			account.account_type
																		}{" "}
																		Account
																	</strong>
																</div>
																<div className="text-muted small mb-3">
																	<div>
																		****
																		{account.account_number.slice(
																			-4
																		)}
																	</div>
																	<div>
																		Current
																		Balance:{" "}
																		{formatCurrency(
																			account.balance ||
																				0
																		)}
																	</div>
																	{depositAmount && (
																		<div className="text-success fw-bold">
																			New
																			Balance:{" "}
																			{formatCurrency(
																				(account.balance ||
																					0) +
																					parseFloat(
																						depositAmount ||
																							0
																					)
																			)}
																		</div>
																	)}
																</div>
																<button
																	type="button"
																	className="btn btn-success w-100"
																	onClick={() =>
																		handleDeposit(
																			account.id
																		)
																	}
																	disabled={
																		!depositAmount ||
																		parseFloat(
																			depositAmount
																		) <=
																			0 ||
																		depositLoading
																	}
																>
																	{depositLoading ? (
																		<>
																			<div
																				className="spinner-border spinner-border-sm me-2"
																				role="status"
																			>
																				<span className="visually-hidden">
																					Processing...
																				</span>
																			</div>
																			Processing
																			Deposit...
																		</>
																	) : (
																		<>
																			<CheckCircle
																				size={
																					16
																				}
																				className="me-2"
																			/>
																			Deposit{" "}
																			{depositAmount
																				? formatCurrency(
																						parseFloat(
																							depositAmount
																						)
																				  )
																				: "$0.00"}
																		</>
																	)}
																</button>
															</div>
														</div>
													</div>
												)
											)}
										</div>
									</div>

									{depositAmount &&
										parseFloat(depositAmount) > 0 && (
											<div className="alert alert-info">
												<div className="d-flex align-items-center">
													<DollarSign
														size={20}
														className="me-2"
													/>
													<div>
														<strong>
															Transaction Summary:
														</strong>
														<br />
														Amount:{" "}
														{formatCurrency(
															parseFloat(
																depositAmount
															)
														)}{" "}
														will be deposited to the
														selected account.
														<br />
														This transaction will be
														processed immediately
														and cannot be reversed.
													</div>
												</div>
											</div>
										)}
								</form>
							) : (
								<div className="alert alert-warning">
									<AlertCircle size={16} className="me-2" />
									This customer has no active accounts
									available for deposits. Please contact the
									customer to set up an account first.
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CashDepositTab;
