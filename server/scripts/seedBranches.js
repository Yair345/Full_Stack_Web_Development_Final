const { sequelize, Branch, BranchStatistics, User } = require('./src/models');
const BranchService = require('./src/services/branch.service');
const { connectDB } = require('./src/config/database');

async function seedBranchData() {
    try {
        console.log('🌱 Starting branch data seeding...');

        // Connect to database
        await connectDB();

        // Sample branch data
        const branchesData = [
            {
                branch_code: 'TLV001',
                branch_name: 'Tel Aviv Central Branch',
                address: '123 Rothschild Boulevard',
                city: 'Tel Aviv',
                state: 'Central District',
                postal_code: '6511001',
                phone: '+972-3-1234567',
                email: 'telaviv@securebank.co.il',
                opening_hours: {
                    monday: '08:30-17:00',
                    tuesday: '08:30-17:00',
                    wednesday: '08:30-17:00',
                    thursday: '08:30-17:00',
                    friday: '08:30-13:00',
                    saturday: 'closed',
                    sunday: '09:00-15:00'
                },
                services_offered: [
                    'personal_banking',
                    'business_banking',
                    'loans',
                    'mortgages',
                    'investments',
                    'currency_exchange',
                    'safe_deposit_boxes'
                ]
            },
            {
                branch_code: 'JER001',
                branch_name: 'Jerusalem Main Branch',
                address: '45 King George Street',
                city: 'Jerusalem',
                state: 'Jerusalem District',
                postal_code: '9426224',
                phone: '+972-2-7654321',
                email: 'jerusalem@securebank.co.il',
                opening_hours: {
                    monday: '08:30-17:00',
                    tuesday: '08:30-17:00',
                    wednesday: '08:30-17:00',
                    thursday: '08:30-17:00',
                    friday: '08:30-13:00',
                    saturday: 'closed',
                    sunday: '09:00-15:00'
                },
                services_offered: [
                    'personal_banking',
                    'business_banking',
                    'loans',
                    'mortgages',
                    'investments',
                    'safe_deposit_boxes'
                ]
            },
            {
                branch_code: 'HFA001',
                branch_name: 'Haifa Port Branch',
                address: '78 HaNassi Avenue',
                city: 'Haifa',
                state: 'Haifa District',
                postal_code: '3109701',
                phone: '+972-4-9876543',
                email: 'haifa@securebank.co.il',
                opening_hours: {
                    monday: '08:30-17:00',
                    tuesday: '08:30-17:00',
                    wednesday: '08:30-17:00',
                    thursday: '08:30-17:00',
                    friday: '08:30-13:00',
                    saturday: 'closed',
                    sunday: '09:00-15:00'
                },
                services_offered: [
                    'personal_banking',
                    'business_banking',
                    'loans',
                    'currency_exchange',
                    'international_transfers'
                ]
            }
        ];

        // Create branches if they don't exist
        for (const branchData of branchesData) {
            const [branch, created] = await Branch.findOrCreate({
                where: { branch_code: branchData.branch_code },
                defaults: branchData
            });

            if (created) {
                console.log(`✅ Created branch: ${branch.branch_name} (${branch.branch_code})`);
            } else {
                console.log(`ℹ️  Branch already exists: ${branch.branch_name} (${branch.branch_code})`);
            }

            // Generate statistics for the last 30 days
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);

                try {
                    await BranchService.generateDailyStatistics(branch.id, date);
                } catch (error) {
                    // Statistics might already exist or other error
                    console.log(`📊 Statistics for ${branch.branch_code} on ${date.toDateString()}: ${error.message}`);
                }
            }
        }

        // Update some users to be assigned to branches (for testing)
        const users = await User.findAll({
            where: { role: 'customer' },
            limit: 30
        });

        const branches = await Branch.findAll({ where: { is_active: true } });

        let branchIndex = 0;
        for (const user of users) {
            await user.update({
                branch_id: branches[branchIndex % branches.length].id
            });
            branchIndex++;
        }

        console.log(`👥 Updated ${users.length} users with branch assignments`);
        console.log('🎉 Branch data seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding branch data:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the seeding
seedBranchData();
