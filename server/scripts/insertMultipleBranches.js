const { sequelize } = require('../src/config/database');
const Branch = require('../src/models/Branch.model');

// Sample branches data
const sampleBranches = [
    {
        branch_code: 'JER001',
        branch_name: 'Jerusalem Main Branch',
        address: '456 King George Street',
        city: 'Jerusalem',
        state: 'Jerusalem District',
        postal_code: '9426232',
        country: 'Israel',
        phone: '+972-2-6666666',
        email: 'jerusalem.main@securebank.com',
        manager_id: null,
        is_active: true
    },
    {
        branch_code: 'HAI001',
        branch_name: 'Haifa Port Branch',
        address: '789 Ben Gurion Avenue',
        city: 'Haifa',
        state: 'Haifa District',
        postal_code: '3508409',
        country: 'Israel',
        phone: '+972-4-7777777',
        email: 'haifa.port@securebank.com',
        manager_id: null,
        is_active: true
    },
    {
        branch_code: 'BSH001',
        branch_name: 'Beer Sheva Central Branch',
        address: '321 Rager Boulevard',
        city: 'Beer Sheva',
        state: 'Southern District',
        postal_code: '8410501',
        country: 'Israel',
        phone: '+972-8-8888888',
        email: 'beersheva.central@securebank.com',
        manager_id: null,
        is_active: true
    }
];

async function insertMultipleBranches() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        console.log('🏦 Inserting multiple branches...\n');

        for (const branchData of sampleBranches) {
            try {
                const branch = await Branch.create({
                    ...branchData,
                    opening_hours: {
                        monday: "08:30-17:00",
                        tuesday: "08:30-17:00",
                        wednesday: "08:30-17:00",
                        thursday: "08:30-17:00",
                        friday: "08:30-13:00",
                        saturday: "closed",
                        sunday: "09:00-15:00"
                    },
                    services_offered: [
                        "personal_banking",
                        "business_banking",
                        "loans",
                        "mortgages",
                        "investments"
                    ]
                });

                console.log(`✅ Created branch: ${branch.branch_name} (${branch.branch_code})`);

            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log(`⚠️  Branch ${branchData.branch_code} already exists, skipping...`);
                } else {
                    console.log(`❌ Error creating branch ${branchData.branch_code}:`, error.message);
                }
            }
        }

        console.log('\n🎉 Branch insertion process completed!');

        // Show all branches
        const allBranches = await Branch.findAll({
            attributes: ['id', 'branch_code', 'branch_name', 'city', 'is_active']
        });

        console.log('\n📋 Current branches in database:');
        allBranches.forEach(branch => {
            console.log(`   ${branch.id}. ${branch.branch_name} (${branch.branch_code}) - ${branch.city}`);
        });

        await sequelize.close();
        console.log('\n✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Custom branch insertion function
async function insertCustomBranch(branchData) {
    try {
        await sequelize.authenticate();

        const branch = await Branch.create({
            ...branchData,
            opening_hours: branchData.opening_hours || {
                monday: "08:30-17:00",
                tuesday: "08:30-17:00",
                wednesday: "08:30-17:00",
                thursday: "08:30-17:00",
                friday: "08:30-13:00",
                saturday: "closed",
                sunday: "09:00-15:00"
            },
            services_offered: branchData.services_offered || [
                "personal_banking",
                "business_banking",
                "loans",
                "mortgages",
                "investments"
            ]
        });

        console.log('✅ Custom branch created:', {
            id: branch.id,
            branch_code: branch.branch_code,
            branch_name: branch.branch_name,
            city: branch.city
        });

        await sequelize.close();
        return branch;

    } catch (error) {
        console.error('❌ Error inserting custom branch:', error.message);
        throw error;
    }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    // No arguments, insert sample branches
    insertMultipleBranches();
} else if (args[0] === 'custom') {
    // Example custom branch
    const customBranch = {
        branch_code: 'CUS001',
        branch_name: 'Custom Branch Name',
        address: '999 Custom Street',
        city: 'Custom City',
        state: 'Custom State',
        postal_code: '12345',
        country: 'Israel',
        phone: '+972-9-9999999',
        email: 'custom@securebank.com'
    };

    insertCustomBranch(customBranch);
} else {
    console.log('Usage:');
    console.log('  node scripts/insertMultipleBranches.js          # Insert sample branches');
    console.log('  node scripts/insertMultipleBranches.js custom   # Insert custom branch');
}
