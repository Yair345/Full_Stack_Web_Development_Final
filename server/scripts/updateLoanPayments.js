const { Loan } = require('../src/models');
const { sequelize } = require('../src/config/database');

/**
 * Script to update existing loans with calculated monthly payments
 * This will fix loans where monthly_payment is NULL in the database
 */
async function updateLoanPayments() {
    try {
        console.log('Starting loan payment updates...');

        // Connect to database
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Find all loans where monthly_payment is NULL
        const loansToUpdate = await Loan.findAll({
            where: {
                monthly_payment: null
            }
        });

        console.log(`Found ${loansToUpdate.length} loans with NULL monthly payments.`);

        let updatedCount = 0;

        for (const loan of loansToUpdate) {
            try {
                // Calculate the monthly payment
                const monthlyPayment = loan.calculateMonthlyPayment();

                // Update the loan record
                await loan.update({
                    monthly_payment: monthlyPayment
                });

                updatedCount++;
                console.log(`Updated loan ID ${loan.id}: monthly_payment = ${monthlyPayment}`);
            } catch (error) {
                console.error(`Failed to update loan ID ${loan.id}:`, error.message);
            }
        }

        console.log(`Successfully updated ${updatedCount} loans.`);

        // Verify the updates
        const remainingNullPayments = await Loan.count({
            where: {
                monthly_payment: null
            }
        });

        console.log(`Remaining loans with NULL monthly payments: ${remainingNullPayments}`);

    } catch (error) {
        console.error('Error updating loan payments:', error);
    } finally {
        // Close database connection
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

// Run the script if called directly
if (require.main === module) {
    updateLoanPayments()
        .then(() => {
            console.log('Script completed successfully.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = updateLoanPayments;
