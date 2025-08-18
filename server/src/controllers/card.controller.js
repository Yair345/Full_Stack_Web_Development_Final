const Card = require('../models/Card.model');
const Account = require('../models/Account.model');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, ACCOUNT_TYPES } = require('../utils/constants');
const { AppError } = require('../utils/error.utils');
const bcrypt = require('bcrypt');

// Helper function for error handling
const handleError = (res, error) => {
    console.error('Controller error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

/**
 * Get all cards for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCards = async (req, res) => {
    try {
        // Get user_id from req.user (set by auth middleware)
        const user_id = req.user?.id || req.user?.user_id;

        if (!user_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const { account_id, status, card_type } = req.query;

        // Build where conditions
        const whereConditions = {};

        // Filter by account if specified, otherwise get all user's cards
        if (account_id) {
            // Verify the account belongs to the user
            const account = await Account.findOne({
                where: {
                    id: account_id,
                    user_id
                }
            });

            if (!account) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND
                });
            }

            whereConditions.account_id = account_id;
        }

        // Add other filters
        if (status) whereConditions.status = status;
        if (card_type) whereConditions.card_type = card_type;

        const cards = await Card.findAll({
            where: whereConditions,
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { user_id },
                    attributes: ['id', 'account_number', 'account_name', 'account_type', 'balance']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Convert to safe JSON format
        const safeCards = cards.map(card => ({
            ...card.toSafeJSON(),
            // Include full number for client-side toggle functionality
            // Note: In a production environment, this should require additional authentication
            full_card_number: card.card_number,
            account: card.account ? {
                ...card.account.toJSON(),
                account_number: card.account.getMaskedAccountNumber()
            } : null
        }));

        res.json({
            success: true,
            data: safeCards,
            count: safeCards.length
        });

    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch cards',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get a specific card by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCard = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { id } = req.params;

        if (!user_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const card = await Card.findOne({
            where: { id },
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { user_id },
                    attributes: ['id', 'account_number', 'account_name', 'account_type', 'balance']
                }
            ]
        });

        if (!card) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Card not found'
            });
        }

        const safeCard = {
            ...card.toSafeJSON(),
            account: card.account ? {
                ...card.account.toJSON(),
                account_number: card.account.getMaskedAccountNumber()
            } : null
        };

        res.json({
            success: true,
            data: safeCard
        });

    } catch (error) {
        console.error('Error fetching card:', error);
        handleError(res, error);
    }
};

/**
 * Create a new card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCard = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { account_id, card_type, card_name, daily_limit, monthly_limit, pin } = req.body;

        if (!user_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Verify the account belongs to the user
        const account = await Account.findOne({
            where: {
                id: account_id,
                user_id,
                is_active: true
            }
        });

        if (!account) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND
            });
        }

        // Check if the account type supports cards (not savings accounts)
        if (account.account_type === ACCOUNT_TYPES.SAVINGS) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Cards cannot be issued for savings accounts'
            });
        }

        // Check how many active cards the account already has
        const existingCardsCount = await Card.count({
            where: {
                account_id,
                status: ['active', 'blocked'] // Don't count cancelled/expired cards
            }
        });

        if (existingCardsCount >= 3) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Maximum number of cards (3) reached for this account'
            });
        }

        // Generate card number (16 digits, starting with appropriate prefix)
        const generateCardNumber = () => {
            // Different prefixes for different card types
            const prefixes = {
                debit: '4532', // Visa debit
                credit: '5555' // Mastercard credit
            };

            const prefix = prefixes[card_type] || '4532';
            let cardNumber = prefix;

            // Generate remaining 12 digits
            for (let i = 0; i < 12; i++) {
                cardNumber += Math.floor(Math.random() * 10);
            }

            return cardNumber;
        };

        // Generate CVV (3 digits)
        const generateCVV = () => {
            return Math.floor(100 + Math.random() * 900).toString();
        };

        // Generate expiry date (2-5 years from now)
        const generateExpiryDate = () => {
            const now = new Date();
            const yearsToAdd = Math.floor(Math.random() * 4) + 2; // 2-5 years
            const expiryDate = new Date(now.getFullYear() + yearsToAdd, now.getMonth(), 1);
            return expiryDate;
        };

        // Prepare card data
        const cardData = {
            account_id,
            card_type,
            card_name: card_name || `${account.account_name || account.name || 'Account'} Card`,
            card_number: generateCardNumber(),
            cvv: generateCVV(),
            expiry_date: generateExpiryDate(),
            issued_date: new Date(),
            daily_limit: daily_limit || 1000.00,
            monthly_limit: monthly_limit || 30000.00,
            status: 'active'
        };

        // Hash PIN if provided
        if (pin) {
            if (!/^\d{4}$/.test(pin)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'PIN must be exactly 4 digits'
                });
            }
            cardData.pin_hash = await bcrypt.hash(pin, 10);
        }

        // Create the card
        const card = await Card.create(cardData);

        // Fetch the created card with account details
        const createdCard = await Card.findOne({
            where: { id: card.id },
            include: [
                {
                    model: Account,
                    as: 'account',
                    attributes: ['id', 'account_number', 'account_name', 'account_type', 'balance']
                }
            ]
        });

        const safeCard = {
            ...createdCard.toSafeJSON(),
            account: createdCard.account ? {
                ...createdCard.account.toJSON(),
                account_number: createdCard.account.getMaskedAccountNumber()
            } : null
        };

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Card created successfully',
            data: safeCard
        });

    } catch (error) {
        console.error('Error creating card:', error);
        handleError(res, error);
    }
};

/**
 * Update card settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCard = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { id } = req.params;
        const updates = req.body;

        if (!user_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Find the card and verify ownership
        const card = await Card.findOne({
            where: { id },
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { user_id }
                }
            ]
        });

        if (!card) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Card not found'
            });
        }

        // Don't allow updates to cancelled or expired cards
        if (card.status === 'cancelled' || card.status === 'expired') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Cannot update cancelled or expired cards'
            });
        }

        // Filter allowed updates
        const allowedUpdates = {
            card_name: updates.card_name,
            daily_limit: updates.daily_limit,
            monthly_limit: updates.monthly_limit,
            contactless_enabled: updates.contactless_enabled,
            online_transactions_enabled: updates.online_transactions_enabled,
            international_transactions_enabled: updates.international_transactions_enabled
        };

        // Remove undefined values
        Object.keys(allowedUpdates).forEach(key => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        // Update the card
        await card.update(allowedUpdates);

        // Fetch updated card with account details
        const updatedCard = await Card.findOne({
            where: { id },
            include: [
                {
                    model: Account,
                    as: 'account',
                    attributes: ['id', 'account_number', 'account_name', 'account_type', 'balance']
                }
            ]
        });

        const safeCard = {
            ...updatedCard.toSafeJSON(),
            account: updatedCard.account ? {
                ...updatedCard.account.toJSON(),
                account_number: updatedCard.account.getMaskedAccountNumber()
            } : null
        };

        res.json({
            success: true,
            message: 'Card updated successfully',
            data: safeCard
        });

    } catch (error) {
        console.error('Error updating card:', error);
        handleError(res, error);
    }
};

/**
 * Block/unblock a card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleCardBlock = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { id } = req.params;

        if (!user_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Find the card and verify ownership
        const card = await Card.findOne({
            where: { id },
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { user_id }
                }
            ]
        });

        if (!card) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Card not found'
            });
        }

        // Don't allow blocking cancelled or expired cards
        if (card.status === 'cancelled' || card.status === 'expired') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Cannot block/unblock cancelled or expired cards'
            });
        }

        // Toggle status
        const newStatus = card.status === 'blocked' ? 'active' : 'blocked';
        await card.update({
            status: newStatus,
            blocked_until: newStatus === 'blocked' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null // 24 hours
        });

        // Fetch updated card
        const updatedCard = await Card.findOne({
            where: { id },
            include: [
                {
                    model: Account,
                    as: 'account',
                    attributes: ['id', 'account_number', 'account_name', 'account_type', 'balance']
                }
            ]
        });

        const safeCard = {
            ...updatedCard.toSafeJSON(),
            account: updatedCard.account ? {
                ...updatedCard.account.toJSON(),
                account_number: updatedCard.account.getMaskedAccountNumber()
            } : null
        };

        res.json({
            success: true,
            message: `Card ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
            data: safeCard
        });

    } catch (error) {
        console.error('Error toggling card block:', error);
        handleError(res, error);
    }
};

/**
 * Cancel a card (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelCard = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { id } = req.params;

        if (!user_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Find the card and verify ownership
        const card = await Card.findOne({
            where: { id },
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { user_id }
                }
            ]
        });

        if (!card) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Card not found'
            });
        }

        // Don't allow cancelling already cancelled cards
        if (card.status === 'cancelled') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Card is already cancelled'
            });
        }

        // Update status to cancelled
        await card.update({ status: 'cancelled' });

        res.json({
            success: true,
            message: 'Card cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling card:', error);
        handleError(res, error);
    }
};

/**
 * Change card PIN
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePin = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { id } = req.params;
        const { current_pin, new_pin } = req.body;

        if (!user_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Find the card and verify ownership
        const card = await Card.findOne({
            where: { id },
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { user_id }
                }
            ]
        });

        if (!card) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Card not found'
            });
        }

        if (!card.canBeUsed()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Cannot change PIN for inactive cards'
            });
        }

        // Validate new PIN
        if (!/^\d{4}$/.test(new_pin)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'PIN must be exactly 4 digits'
            });
        }

        // Verify current PIN if it exists
        if (card.pin_hash) {
            if (!current_pin) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Current PIN is required'
                });
            }

            const isValidPin = await bcrypt.compare(current_pin, card.pin_hash);
            if (!isValidPin) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Current PIN is incorrect'
                });
            }
        }

        // Hash and set new PIN
        const pinHash = await bcrypt.hash(new_pin, 10);
        await card.update({ pin_hash: pinHash });

        res.json({
            success: true,
            message: 'PIN changed successfully'
        });

    } catch (error) {
        console.error('Error changing PIN:', error);
        handleError(res, error);
    }
};

module.exports = {
    getCards,
    getCard,
    createCard,
    updateCard,
    toggleCardBlock,
    cancelCard,
    changePin
};
