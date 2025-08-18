import { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatCurrency } from './loanUtils';

const LoanPaymentModal = ({ loan, onPayment, onClose, loading }) => {
    const [paymentAmount, setPaymentAmount] = useState(loan.monthlyPayment || '');
    const [paymentType, setPaymentType] = useState('regular');
    const [errors, setErrors] = useState({});

    const remainingBalance = loan.remainingBalance || loan.currentBalance || 0;
    const monthlyPayment = loan.monthlyPayment || 0;

    const validatePayment = () => {
        const newErrors = {};
        const amount = parseFloat(paymentAmount);

        if (!paymentAmount || amount <= 0) {
            newErrors.amount = 'Payment amount must be greater than 0';
        } else if (amount > remainingBalance) {
            newErrors.amount = 'Payment amount cannot exceed remaining balance';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePaymentTypeChange = (type) => {
        setPaymentType(type);
        switch (type) {
            case 'regular':
                setPaymentAmount(monthlyPayment.toString());
                break;
            case 'minimum':
                // For demonstration, minimum is 10% of monthly payment
                setPaymentAmount((monthlyPayment * 0.1).toFixed(2));
                break;
            case 'payoff':
                setPaymentAmount(remainingBalance.toString());
                break;
            case 'custom':
                setPaymentAmount('');
                break;
            default:
                break;
        }
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePayment()) {
            return;
        }

        try {
            await onPayment(loan.id, parseFloat(paymentAmount));
            onClose();
        } catch (error) {
            setErrors({ general: error.message });
        }
    };

    const isPayoff = parseFloat(paymentAmount) >= remainingBalance;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title d-flex align-items-center">
                            <CreditCard size={20} className="me-2 text-primary" />
                            Make Loan Payment
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={loading}
                        ></button>
                    </div>

                    <div className="modal-body">
                        {/* Loan Information */}
                        <Card className="mb-4">
                            <div className="row g-2 small">
                                <div className="col-6">
                                    <span className="text-muted">Loan Type:</span>
                                </div>
                                <div className="col-6 text-end">
                                    <span className="fw-medium">
                                        {loan.loan_type || loan.type}
                                    </span>
                                </div>
                                <div className="col-6">
                                    <span className="text-muted">Current Balance:</span>
                                </div>
                                <div className="col-6 text-end">
                                    <span className="fw-bold">
                                        {formatCurrency(remainingBalance)}
                                    </span>
                                </div>
                                <div className="col-6">
                                    <span className="text-muted">Monthly Payment:</span>
                                </div>
                                <div className="col-6 text-end">
                                    <span className="fw-medium">
                                        {formatCurrency(monthlyPayment)}
                                    </span>
                                </div>
                                {loan.nextPaymentDue && (
                                    <>
                                        <div className="col-6">
                                            <span className="text-muted">Next Due Date:</span>
                                        </div>
                                        <div className="col-6 text-end">
                                            <span className="fw-medium">
                                                {new Date(loan.nextPaymentDue).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        <form onSubmit={handleSubmit}>
                            {/* Payment Type Selection */}
                            <div className="mb-3">
                                <label className="form-label">Payment Type</label>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="paymentType"
                                            id="regular"
                                            value="regular"
                                            checked={paymentType === 'regular'}
                                            onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                        />
                                        <label className="btn btn-outline-primary w-100" htmlFor="regular">
                                            Regular Payment
                                        </label>
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="paymentType"
                                            id="payoff"
                                            value="payoff"
                                            checked={paymentType === 'payoff'}
                                            onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                        />
                                        <label className="btn btn-outline-success w-100" htmlFor="payoff">
                                            Pay Off Loan
                                        </label>
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="paymentType"
                                            id="minimum"
                                            value="minimum"
                                            checked={paymentType === 'minimum'}
                                            onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                        />
                                        <label className="btn btn-outline-warning w-100" htmlFor="minimum">
                                            Minimum Payment
                                        </label>
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="paymentType"
                                            id="custom"
                                            value="custom"
                                            checked={paymentType === 'custom'}
                                            onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                        />
                                        <label className="btn btn-outline-info w-100" htmlFor="custom">
                                            Custom Amount
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Amount */}
                            <div className="mb-3">
                                <label className="form-label">Payment Amount</label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className={errors.amount ? 'is-invalid' : ''}
                                        disabled={paymentType !== 'custom'}
                                    />
                                    {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            {paymentAmount && !errors.amount && (
                                <div className="alert alert-info">
                                    <div className="d-flex align-items-center mb-2">
                                        {isPayoff ? (
                                            <CheckCircle size={16} className="text-success me-2" />
                                        ) : (
                                            <AlertCircle size={16} className="text-info me-2" />
                                        )}
                                        <strong>Payment Summary</strong>
                                    </div>
                                    <div className="row g-1 small">
                                        <div className="col-6">Payment Amount:</div>
                                        <div className="col-6 text-end fw-bold">
                                            {formatCurrency(parseFloat(paymentAmount))}
                                        </div>
                                        <div className="col-6">Remaining Balance:</div>
                                        <div className="col-6 text-end">
                                            {formatCurrency(Math.max(0, remainingBalance - parseFloat(paymentAmount)))}
                                        </div>
                                        {isPayoff && (
                                            <div className="col-12 text-center mt-2">
                                                <span className="badge bg-success">
                                                    🎉 This payment will pay off your loan!
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* General Error */}
                            {errors.general && (
                                <div className="alert alert-danger">
                                    {errors.general}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="modal-footer">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={isPayoff ? "success" : "primary"}
                            onClick={handleSubmit}
                            disabled={loading || !paymentAmount || Object.keys(errors).length > 0}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={16} className="me-2" />
                                    {isPayoff ? 'Pay Off Loan' : 'Make Payment'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanPaymentModal;
