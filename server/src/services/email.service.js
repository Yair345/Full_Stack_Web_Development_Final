const nodemailer = require('nodemailer');
const { config } = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    if (!config.email.user || !config.email.password) {
      console.warn('⚠️ Email configuration not found. Email services will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
      } else {
        console.log('✅ Email transporter verified successfully');
      }
    });
  }

  /**
   * Send email
   * @param {Object} mailOptions - Email options
   * @returns {Promise} Send result
   */
  async sendEmail(mailOptions) {
    if (!this.transporter) {
      throw new Error('Email transporter not configured');
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Bank App" <${config.email.from}>`,
        ...mailOptions
      });

      console.log('✅ Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} user - User object
   * @returns {Promise} Send result
   */
  async sendWelcomeEmail(user) {
    const mailOptions = {
      to: user.email,
      subject: 'Welcome to Bank App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Bank App</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Hello ${user.first_name}!</h2>
            
            <p>Welcome to Bank App! We're excited to have you as our customer.</p>
            
            <p>Your account has been successfully created with the following details:</p>
            <ul>
              <li><strong>Username:</strong> ${user.username}</li>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Next Steps:</h3>
              <ol>
                <li>Verify your email address</li>
                <li>Complete your profile</li>
                <li>Open your first account</li>
                <li>Set up online banking</li>
              </ol>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact our customer support.</p>
            
            <p>Best regards,<br>The Bank App Team</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send email verification email
   * @param {Object} user - User object
   * @param {String} token - Verification token
   * @returns {Promise} Send result
   */
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${config.cors.origin}/verify-email?token=${token}`;

    const mailOptions = {
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Email Verification</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Hello ${user.first_name}!</h2>
            
            <p>Thank you for registering with Bank App. To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
            
            <div style="background-color: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b;">
              <strong>Important:</strong> This verification link will expire in 24 hours.
            </div>
            
            <p>If you didn't create an account with Bank App, please ignore this email.</p>
            
            <p>Best regards,<br>The Bank App Team</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {String} token - Reset token
   * @returns {Promise} Send result
   */
  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${config.cors.origin}/reset-password?token=${token}`;

    const mailOptions = {
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1>Password Reset</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Hello ${user.first_name}!</h2>
            
            <p>We received a request to reset your password for your Bank App account.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
            
            <div style="background-color: #fee2e2; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626;">
              <strong>Important:</strong> 
              <ul>
                <li>This reset link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>For security, change your password immediately after reset</li>
              </ul>
            </div>
            
            <p>If you continue to have problems, please contact our customer support.</p>
            
            <p>Best regards,<br>The Bank App Team</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send transaction notification email
   * @param {Object} user - User object
   * @param {Object} transaction - Transaction object
   * @returns {Promise} Send result
   */
  async sendTransactionNotification(user, transaction) {
    const isCredit = transaction.transaction_type === 'deposit' ||
      (transaction.transaction_type === 'transfer' && transaction.to_account_id);

    const mailOptions = {
      to: user.email,
      subject: `Transaction ${isCredit ? 'Received' : 'Sent'} - ${transaction.getFormattedAmount()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${isCredit ? '#059669' : '#dc2626'}; color: white; padding: 20px; text-align: center;">
            <h1>Transaction ${isCredit ? 'Received' : 'Sent'}</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Hello ${user.first_name}!</h2>
            
            <p>A transaction has been ${isCredit ? 'credited to' : 'debited from'} your account.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3>Transaction Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${transaction.getFormattedAmount()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Type:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${transaction.transaction_type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reference:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${transaction.transaction_ref}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Date:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(transaction.createdAt).toLocaleString()}</td>
                </tr>
                ${transaction.description ? `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${transaction.description}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b;">
              <strong>Security Reminder:</strong> If you don't recognize this transaction, please contact us immediately.
            </div>
            
            <p>You can view all your transactions in your online banking dashboard.</p>
            
            <p>Best regards,<br>The Bank App Team</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send login alert email
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information
   * @returns {Promise} Send result
   */
  async sendLoginAlert(user, loginInfo) {
    const mailOptions = {
      to: user.email,
      subject: 'New Login to Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Login Alert</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Hello ${user.first_name}!</h2>
            
            <p>We noticed a new login to your Bank App account.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3>Login Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Time:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(loginInfo.timestamp).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>IP Address:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${loginInfo.ipAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Device:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${loginInfo.userAgent}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fee2e2; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626;">
              <strong>Security Alert:</strong> If this wasn't you, please:
              <ul>
                <li>Change your password immediately</li>
                <li>Contact our customer support</li>
                <li>Review your account activity</li>
              </ul>
            </div>
            
            <p>If this was you, you can safely ignore this email.</p>
            
            <p>Best regards,<br>The Bank App Team</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send monthly statement email
   * @param {Object} user - User object
   * @param {Object} statement - Statement data
   * @returns {Promise} Send result
   */
  async sendMonthlyStatement(user, statement) {
    const mailOptions = {
      to: user.email,
      subject: `Monthly Statement - ${statement.month}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Monthly Statement</h1>
            <h2>${statement.month}</h2>
          </div>
          
          <div style="padding: 20px;">
            <h2>Hello ${user.first_name}!</h2>
            
            <p>Your monthly statement for ${statement.month} is now available.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3>Account Summary:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Opening Balance:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${statement.openingBalance}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Closing Balance:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${statement.closingBalance}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Credits:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${statement.totalCredits}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Debits:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${statement.totalDebits}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Number of Transactions:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${statement.transactionCount}</td>
                </tr>
              </table>
            </div>
            
            <p>You can download the detailed statement from your online banking dashboard.</p>
            
            <p>Thank you for banking with us!</p>
            
            <p>Best regards,<br>The Bank App Team</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }
}

// Create and export singleton instance
const emailService = new EmailService();
module.exports = emailService;
