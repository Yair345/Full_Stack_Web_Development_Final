import React from 'react';
import { X, CreditCard, DollarSign, Calendar, Shield, Eye, Hash, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/helpers';

const AccountDetailsModal = ({ account, isOpen, onClose }) => {
    if (!account) return null;

    const getAccountTypeBadge = (type) => {
        switch (type) {
            case "checking":
                return { class: "badge bg-primary", label: "Checking" };
            case "savings":
                return { class: "badge bg-success", label: "Savings" };
            case "credit":
                return { class: "badge bg-warning text-dark", label: "Credit" };
            default:
                return { class: "badge bg-secondary", label: "Account" };
        }
    };

    const getAccountIcon = (type) => {
        switch (type) {
            case "savings":
                return <TrendingUp size={24} className="text-success" />;
            case "credit":
                return <CreditCard size={24} className="text-warning" />;
            default:
                return <CreditCard size={24} className="text-primary" />;
        }
    };

    const getStatusBadge = (status) => {
        return status === 'active' 
            ? <span className="badge bg-success-subtle text-success">Active</span>
            : <span className="badge bg-danger-subtle text-danger">Inactive</span>;
    };

    const typeBadge = getAccountTypeBadge(account.type);
    const accountIcon = getAccountIcon(account.type);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="border-0">
                <DialogHeader className="bg-light border-bottom">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col">
                                <div className="d-flex align-items-center">
                                    {accountIcon}
                                    <div className="ms-3">
                                        <DialogTitle className="mb-1 text-dark">
                                            {account.name || `${typeBadge.label} Account`}
                                        </DialogTitle>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={typeBadge.class}>{typeBadge.label}</span>
                                            {getStatusBadge(account.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-auto">
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => onClose(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="modal-body bg-white">
                    <div className="container-fluid">
                        {/* Account Information */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="card-title d-flex align-items-center mb-3 text-primary">
                                            <Hash size={16} className="me-2" />
                                            Account Details
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-medium">Account ID</label>
                                                <div className="fw-bold font-monospace fs-6">#{account.id}</div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-medium">Account Number</label>
                                                <div className="fw-bold font-monospace fs-6 text-break">{account.number}</div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-medium">Account Type</label>
                                                <div className="fw-medium">{typeBadge.label}</div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-medium">Status</label>
                                                <div>{getStatusBadge(account.status)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="card-title d-flex align-items-center mb-3 text-success">
                                            <DollarSign size={16} className="me-2" />
                                            Balance Information
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-medium">Current Balance</label>
                                                <div className={`h4 fw-bold mb-0 ${
                                                    account.balance >= 0 ? "text-success" : "text-danger"
                                                }`}>
                                                    {formatCurrency(account.balance, account.currency)}
                                                </div>
                                            </div>
                                            {account.type === "checking" && account.limit > 0 && (
                                                <>
                                                    <div className="col-12">
                                                        <label className="form-label small text-muted fw-medium">Available Balance</label>
                                                        <div className="fw-medium text-success fs-5">
                                                            {formatCurrency(account.balance + account.limit, account.currency)}
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label small text-muted fw-medium">Overdraft Limit</label>
                                                        <div className="fw-medium">
                                                            {formatCurrency(account.limit, account.currency)}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {account.type === "credit" && account.limit && (
                                                <div className="col-12">
                                                    <label className="form-label small text-muted fw-medium">Credit Limit</label>
                                                    <div className="fw-medium">
                                                        {formatCurrency(account.limit, account.currency)}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-medium">Currency</label>
                                                <div className="fw-medium">{account.currency || 'USD'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Features */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="card-title d-flex align-items-center mb-3 text-info">
                                            <Calendar size={16} className="me-2" />
                                            Account History
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-medium">Opened Date</label>
                                                <div className="fw-medium">
                                                    {new Date(account.openDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-medium">Last Updated</label>
                                                <div className="fw-medium">
                                                    {account.updatedAt ? new Date(account.updatedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="card-title d-flex align-items-center mb-3 text-warning">
                                            <Shield size={16} className="me-2" />
                                            Account Features
                                        </h6>
                                        <div className="row g-3">
                                            {account.type === "savings" && account.interestRate && (
                                                <div className="col-12">
                                                    <label className="form-label small text-muted fw-medium">Interest Rate</label>
                                                    <div className="fw-medium text-success">
                                                        {account.interestRate.toFixed(2)}% APY
                                                    </div>
                                                </div>
                                            )}
                                            {account.monthlyFee > 0 && (
                                                <div className="col-12">
                                                    <label className="form-label small text-muted fw-medium">Monthly Fee</label>
                                                    <div className="fw-medium text-warning">
                                                        {formatCurrency(account.monthlyFee, account.currency)}
                                                    </div>
                                                </div>
                                            )}
                                            {account.minimumBalance > 0 && (
                                                <div className="col-12">
                                                    <label className="form-label small text-muted fw-medium">Minimum Balance</label>
                                                    <div className="fw-medium">
                                                        {formatCurrency(account.minimumBalance, account.currency)}
                                                    </div>
                                                </div>
                                            )}
                                            {(!account.monthlyFee || account.monthlyFee === 0) && 
                                             (!account.minimumBalance || account.minimumBalance === 0) && 
                                             (account.type !== "savings" || !account.interestRate) && (
                                                <div className="col-12">
                                                    <div className="text-muted small fst-italic">No special features for this account type.</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer bg-light border-top">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col d-flex justify-content-end gap-2">
                                    <Button variant="secondary" onClick={() => onClose(false)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
};

export default AccountDetailsModal;
