import { useState, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoanApplicationForm = ({ onSubmit, loading, initialLoanType = 'personal' }) => {
    // Interest rates based on loan type and term
    const interestRateOptions = {
        personal: {
            6: 12.5,   // 6 months - 12.5%
            12: 11.0,  // 1 year - 11%
            24: 9.5,   // 2 years - 9.5%
            36: 8.0,   // 3 years - 8%
            48: 7.5,   // 4 years - 7.5%
            60: 7.0    // 5 years - 7%
        },
        auto: {
            12: 5.5,   // 1 year - 5.5%
            24: 4.5,   // 2 years - 4.5%
            36: 4.0,   // 3 years - 4%
            48: 3.8,   // 4 years - 3.8%
            60: 3.5,   // 5 years - 3.5%
            72: 3.9    // 6 years - 3.9%
        },
        mortgage: {
            120: 4.5,  // 10 years - 4.5%
            180: 4.2,  // 15 years - 4.2%
            240: 4.0,  // 20 years - 4%
            300: 3.8,  // 25 years - 3.8%
            360: 3.5   // 30 years - 3.5%
        },
        business: {
            12: 8.5,   // 1 year - 8.5%
            24: 7.5,   // 2 years - 7.5%
            36: 6.5,   // 3 years - 6.5%
            48: 6.0,   // 4 years - 6%
            60: 5.8    // 5 years - 5.8%
        }
    };

    // Get interest rate for current loan type and term
    const getInterestRate = (loanType, termMonths) => {
        const rates = interestRateOptions[loanType];
        if (rates && rates[termMonths]) {
            return rates[termMonths] / 100; // Convert percentage to decimal
        }
        return 0.08; // Default 8%
    };

    const [formData, setFormData] = useState({
        loan_type: initialLoanType,
        amount: '',
        interest_rate: getInterestRate(initialLoanType, '36'), // Calculate initial rate
        term_months: '36',
        purpose: '',
        collateral_description: '',
        collateral_value: '',
        credit_score: '',
        debt_to_income_ratio: '',
        annual_income: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form when initialLoanType changes
    useEffect(() => {
        if (initialLoanType && initialLoanType !== formData.loan_type) {
            const availableTerms = Object.keys(interestRateOptions[initialLoanType] || {});
            const defaultTerm = availableTerms[0] || '36';
            setFormData(prev => ({
                ...prev,
                loan_type: initialLoanType,
                term_months: defaultTerm,
                interest_rate: getInterestRate(initialLoanType, defaultTerm)
            }));
        }
    }, [initialLoanType]);

    // Get available terms for current loan type
    const getAvailableTerms = () => {
        return Object.keys(interestRateOptions[formData.loan_type] || {});
    };

    // Update interest rate when loan type or term changes
    const updateInterestRate = (loanType, termMonths) => {
        const newRate = getInterestRate(loanType, termMonths);
        setFormData(prev => ({
            ...prev,
            interest_rate: newRate
        }));
    };

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        // Amount validation
        if (!formData.amount) {
            newErrors.amount = 'Loan amount is required';
        } else if (parseFloat(formData.amount) < 1000) {
            newErrors.amount = 'Minimum loan amount is $1,000';
        } else if (parseFloat(formData.amount) > 10000000) {
            newErrors.amount = 'Maximum loan amount is $10,000,000';
        }

        // Purpose validation
        if (!formData.purpose) {
            newErrors.purpose = 'Loan purpose is required';
        } else if (formData.purpose.length < 10) {
            newErrors.purpose = 'Purpose must be at least 10 characters';
        } else if (formData.purpose.length > 1000) {
            newErrors.purpose = 'Purpose cannot exceed 1000 characters';
        }

        // Term validation
        if (!formData.term_months) {
            newErrors.term_months = 'Loan term is required';
        } else {
            const availableTerms = getAvailableTerms();
            if (!availableTerms.includes(formData.term_months)) {
                newErrors.term_months = 'Please select a valid term for this loan type';
            }
        }

        // Interest rate validation (automatically calculated)
        if (formData.interest_rate < 0.0001) {
            newErrors.interest_rate = 'Interest rate must be greater than 0';
        } else if (formData.interest_rate > 0.5) {
            newErrors.interest_rate = 'Interest rate cannot exceed 50%';
        }

        // Optional fields validation
        if (formData.credit_score && (parseInt(formData.credit_score) < 300 || parseInt(formData.credit_score) > 850)) {
            newErrors.credit_score = 'Credit score must be between 300 and 850';
        }

        if (formData.debt_to_income_ratio && (parseFloat(formData.debt_to_income_ratio) < 0 || parseFloat(formData.debt_to_income_ratio) > 100)) {
            newErrors.debt_to_income_ratio = 'Debt-to-income ratio must be between 0% and 100%';
        }

        if (formData.annual_income && parseFloat(formData.annual_income) < 0) {
            newErrors.annual_income = 'Annual income cannot be negative';
        }

        if (formData.collateral_value && parseFloat(formData.collateral_value) < 0) {
            newErrors.collateral_value = 'Collateral value cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Update interest rate when loan type or term changes
        if (field === 'loan_type') {
            const availableTerms = Object.keys(interestRateOptions[value] || {});
            const newTerm = availableTerms.includes(formData.term_months) ? formData.term_months : availableTerms[0];
            setFormData(prev => ({
                ...prev,
                [field]: value,
                term_months: newTerm,
                interest_rate: getInterestRate(value, newTerm)
            }));
        } else if (field === 'term_months') {
            setFormData(prev => ({
                ...prev,
                [field]: value,
                interest_rate: getInterestRate(formData.loan_type, value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Prepare data for API
            const submissionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                term_months: parseInt(formData.term_months),
                interest_rate: parseFloat(formData.interest_rate),
                credit_score: formData.credit_score ? parseInt(formData.credit_score) : null,
                debt_to_income_ratio: formData.debt_to_income_ratio ? parseFloat(formData.debt_to_income_ratio) : null,
                annual_income: formData.annual_income ? parseFloat(formData.annual_income) : null,
                collateral_value: formData.collateral_value ? parseFloat(formData.collateral_value) : null
            };

            await onSubmit(submissionData);
            
            // Reset form on success
            const defaultTerm = Object.keys(interestRateOptions[initialLoanType] || {})[0] || '36';
            setFormData({
                loan_type: initialLoanType,
                amount: '',
                interest_rate: getInterestRate(initialLoanType, defaultTerm),
                term_months: defaultTerm,
                purpose: '',
                collateral_description: '',
                collateral_value: '',
                credit_score: '',
                debt_to_income_ratio: '',
                annual_income: ''
            });
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <div className="d-flex align-items-center mb-4">
                <Send size={20} className="text-primary me-2" />
                <h5 className="fw-medium mb-0">Loan Application</h5>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    {/* Loan Type */}
                    <div className="col-md-6">
                        <label className="form-label">Loan Type <span className="text-danger">*</span></label>
                        <select
                            className={`form-select ${errors.loan_type ? 'is-invalid' : ''}`}
                            value={formData.loan_type}
                            onChange={(e) => handleInputChange('loan_type', e.target.value)}
                            required
                        >
                            <option value="personal">Personal Loan</option>
                            <option value="auto">Auto Loan</option>
                            <option value="mortgage">Mortgage</option>
                            <option value="business">Business Loan</option>
                        </select>
                        {errors.loan_type && <div className="invalid-feedback">{errors.loan_type}</div>}
                    </div>

                    {/* Loan Amount */}
                    <div className="col-md-6">
                        <label className="form-label">Loan Amount <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text">$</span>
                            <Input
                                type="number"
                                placeholder="25,000"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                className={errors.amount ? 'is-invalid' : ''}
                                required
                            />
                            {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                        </div>
                    </div>

                    {/* Interest Rate - READ ONLY */}
                    <div className="col-md-6">
                        <label className="form-label">Interest Rate (%) <span className="text-muted">*Auto-calculated</span></label>
                        <div className="input-group">
                            <Input
                                type="number"
                                step="0.01"
                                value={(formData.interest_rate * 100).toFixed(2)}
                                className="bg-light"
                                readOnly
                                disabled
                            />
                            <span className="input-group-text">%</span>
                        </div>
                        <div className="form-text text-muted">
                            Interest rate is automatically calculated based on loan type and term
                        </div>
                    </div>

                    {/* Term - SELECT BOX */}
                    <div className="col-md-6">
                        <label className="form-label">Term (months) <span className="text-danger">*</span></label>
                        <select
                            className={`form-select ${errors.term_months ? 'is-invalid' : ''}`}
                            value={formData.term_months}
                            onChange={(e) => handleInputChange('term_months', e.target.value)}
                            required
                        >
                            {getAvailableTerms().map(term => (
                                <option key={term} value={term}>
                                    {term} months ({Math.floor(term / 12) > 0 ? `${Math.floor(term / 12)} year${Math.floor(term / 12) > 1 ? 's' : ''}` : ''}{term % 12 > 0 ? ` ${term % 12} month${term % 12 > 1 ? 's' : ''}` : ''})
                                </option>
                            ))}
                        </select>
                        {errors.term_months && <div className="invalid-feedback">{errors.term_months}</div>}
                    </div>

                    {/* Purpose */}
                    <div className="col-12">
                        <label className="form-label">Loan Purpose <span className="text-danger">*</span></label>
                        <textarea
                            className={`form-control ${errors.purpose ? 'is-invalid' : ''}`}
                            rows="3"
                            placeholder="Describe the purpose of this loan (minimum 10 characters)"
                            value={formData.purpose}
                            onChange={(e) => handleInputChange('purpose', e.target.value)}
                            required
                        />
                        <div className="form-text">
                            {formData.purpose.length}/1000 characters
                        </div>
                        {errors.purpose && <div className="invalid-feedback">{errors.purpose}</div>}
                    </div>

                    {/* Optional Financial Information */}
                    <div className="col-12">
                        <h6 className="fw-medium mb-3 mt-3">Financial Information (Optional)</h6>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Credit Score</label>
                        <Input
                            type="number"
                            placeholder="700"
                            value={formData.credit_score}
                            onChange={(e) => handleInputChange('credit_score', e.target.value)}
                            className={errors.credit_score ? 'is-invalid' : ''}
                        />
                        {errors.credit_score && <div className="invalid-feedback">{errors.credit_score}</div>}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Debt-to-Income Ratio (%)</label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="25.00"
                            value={formData.debt_to_income_ratio}
                            onChange={(e) => handleInputChange('debt_to_income_ratio', e.target.value)}
                            className={errors.debt_to_income_ratio ? 'is-invalid' : ''}
                        />
                        {errors.debt_to_income_ratio && <div className="invalid-feedback">{errors.debt_to_income_ratio}</div>}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Annual Income</label>
                        <div className="input-group">
                            <span className="input-group-text">$</span>
                            <Input
                                type="number"
                                placeholder="75,000"
                                value={formData.annual_income}
                                onChange={(e) => handleInputChange('annual_income', e.target.value)}
                                className={errors.annual_income ? 'is-invalid' : ''}
                            />
                        </div>
                        {errors.annual_income && <div className="invalid-feedback">{errors.annual_income}</div>}
                    </div>

                    {/* Collateral Information (for secured loans) */}
                    {(formData.loan_type === 'auto' || formData.loan_type === 'mortgage') && (
                        <>
                            <div className="col-12">
                                <h6 className="fw-medium mb-3 mt-3">Collateral Information</h6>
                            </div>

                            <div className="col-md-8">
                                <label className="form-label">Collateral Description</label>
                                <Input
                                    type="text"
                                    placeholder="2020 Honda Civic or 123 Main St Property"
                                    value={formData.collateral_description}
                                    onChange={(e) => handleInputChange('collateral_description', e.target.value)}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Estimated Value</label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Input
                                        type="number"
                                        placeholder="30,000"
                                        value={formData.collateral_value}
                                        onChange={(e) => handleInputChange('collateral_value', e.target.value)}
                                        className={errors.collateral_value ? 'is-invalid' : ''}
                                    />
                                </div>
                                {errors.collateral_value && <div className="invalid-feedback">{errors.collateral_value}</div>}
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <div className="col-12">
                        <div className="alert alert-info">
                            <AlertCircle size={16} className="me-2" />
                            <small>
                                By submitting this application, you acknowledge that the information provided is accurate 
                                and complete. Your application will be reviewed and you will be notified of the decision.
                            </small>
                        </div>
                        
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100"
                            disabled={isSubmitting || loading}
                        >
                            {isSubmitting || loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Submitting Application...
                                </>
                            ) : (
                                <>
                                    <Send size={16} className="me-2" />
                                    Submit Loan Application
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
};

export default LoanApplicationForm;
