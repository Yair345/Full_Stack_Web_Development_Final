import React, { useState } from 'react';
import { Settings, Trash2, AlertTriangle, Shield, Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import Button from '../../components/ui/Button';
import { accountAPI } from '../../services/api';

const AccountSettingsModal = ({ account, isOpen, onClose, onAccountDeleted }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    if (!account) return null;

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            setDeleteError('');
            
            await accountAPI.deleteAccount(account.id);
            
            // Call the parent callback to refresh the accounts list
            if (onAccountDeleted) {
                onAccountDeleted(account.id);
            }
            
            // Close the modals
            setShowDeleteConfirm(false);
            onClose(false);
            
        } catch (error) {
            console.error('Error deleting account:', error);
            setDeleteError(error.message || 'Failed to delete account. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const canDeleteAccount = () => {
        return account.balance === 0 || account.balance === undefined;
    };

    const getDeleteWarningMessage = () => {
        if (account.balance > 0) {
            return `This account has a balance of ${account.currency || 'USD'} ${account.balance}. You must transfer all funds before deleting the account.`;
        }
        return 'This action cannot be undone. The account will be permanently marked as deleted.';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col">
                                <DialogTitle className="d-flex align-items-center mb-0">
                                    <Settings size={20} className="me-2" />
                                    Account Settings
                                </DialogTitle>
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

                <div className="modal-body">
                    <div className="container-fluid">
                        {/* Account Info Summary */}
                        <div className="card bg-light mb-4">
                            <div className="card-body">
                                <h6 className="card-title mb-2">{account.name || 'Account'}</h6>
                                <p className="card-text small text-muted mb-1">
                                    <strong>Account:</strong> {account.number?.includes('*') ? account.number : `****-****-${account.number?.slice(-4) || '0000'}`}
                                </p>
                                <p className="card-text small text-muted mb-0">
                                    <strong>Type:</strong> {account.type?.charAt(0).toUpperCase() + account.type?.slice(1)} • 
                                    <strong className="ms-2">Balance:</strong> {account.currency || 'USD'} {account.balance || '0.00'}
                                </p>
                            </div>
                        </div>

                        {/* Settings Options */}
                        <div className="row g-3">
                            <div className="col-12">
                                <div className="list-group">
                                    <div className="list-group-item">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <Edit3 size={18} className="text-primary me-3" />
                                                <div>
                                                    <h6 className="mb-1">Edit Account Details</h6>
                                                    <small className="text-muted">Change account name and preferences</small>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" disabled>
                                                Coming Soon
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="list-group-item">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <Shield size={18} className="text-success me-3" />
                                                <div>
                                                    <h6 className="mb-1">Security Settings</h6>
                                                    <small className="text-muted">Manage account security and notifications</small>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" disabled>
                                                Coming Soon
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-4">
                            <hr className="text-danger" />
                            <div className="d-flex align-items-start">
                                <AlertTriangle size={20} className="text-danger me-3 mt-1" />
                                <div className="flex-grow-1">
                                    <h6 className="text-danger mb-2">Danger Zone</h6>
                                    <p className="text-muted small mb-3">
                                        {getDeleteWarningMessage()}
                                    </p>
                                    
                                    {deleteError && (
                                        <div className="alert alert-danger alert-sm mb-3" role="alert">
                                            {deleteError}
                                        </div>
                                    )}

                                    {!showDeleteConfirm ? (
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            className="d-flex align-items-center"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            disabled={!canDeleteAccount()}
                                        >
                                            <Trash2 size={16} className="me-2" />
                                            Delete Account
                                        </Button>
                                    ) : (
                                        <div className="border border-danger rounded p-3 bg-danger-subtle">
                                            <h6 className="text-danger mb-2">Are you absolutely sure?</h6>
                                            <p className="text-danger small mb-3">
                                                Type the account number to confirm deletion: <br />
                                                <code>{account.number?.includes('*') ? account.number : `****-****-${account.number?.slice(-4) || '0000'}`}</code>
                                            </p>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={handleDeleteAccount}
                                                    disabled={isDeleting}
                                                    className="d-flex align-items-center"
                                                >
                                                    {isDeleting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 size={16} className="me-2" />
                                                            Yes, Delete Account
                                                        </>
                                                    )}
                                                </Button>
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowDeleteConfirm(false);
                                                        setDeleteError('');
                                                    }}
                                                    disabled={isDeleting}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col d-flex justify-content-end">
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

export default AccountSettingsModal;
