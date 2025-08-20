#!/usr/bin/env node

/**
 * Migration script to move local file uploads to MongoDB
 * Run this script after implementing MongoDB file storage to migrate existing files
 */

const path = require('path');
const fs = require('fs');
const { connectMongoDB } = require('../src/config/mongodb');
const fileService = require('../src/services/file.service');
const { User } = require('../src/models');
const { connectDB } = require('../src/config/database');

const UPLOADS_DIR = path.join(__dirname, '../uploads/id-pictures');

const migrateFilesToMongoDB = async () => {
    console.log('🔄 Starting file migration to MongoDB...\n');

    try {
        // Connect to databases
        console.log('🔄 Connecting to databases...');
        await connectDB();
        const mongoConnection = await connectMongoDB();

        if (!mongoConnection) {
            throw new Error('MongoDB connection failed');
        }

        await fileService.initialize();
        console.log('✅ Database connections established\n');

        // Check if uploads directory exists
        if (!fs.existsSync(UPLOADS_DIR)) {
            console.log('📁 No uploads directory found. Nothing to migrate.');
            return;
        }

        // Get all files in uploads directory
        const files = fs.readdirSync(UPLOADS_DIR);
        console.log(`📁 Found ${files.length} files to migrate\n`);

        if (files.length === 0) {
            console.log('📁 No files to migrate.');
            return;
        }

        let migrated = 0;
        let skipped = 0;
        let errors = 0;

        for (const filename of files) {
            try {
                const filePath = path.join(UPLOADS_DIR, filename);
                const stats = fs.statSync(filePath);

                // Skip if not a file
                if (!stats.isFile()) {
                    console.log(`⏭️  Skipping ${filename} (not a file)`);
                    skipped++;
                    continue;
                }

                // Check if file already exists in MongoDB
                const exists = await fileService.fileExists(filename);
                if (exists) {
                    console.log(`⏭️  Skipping ${filename} (already in MongoDB)`);
                    skipped++;
                    continue;
                }

                // Extract user ID from filename
                const userIdMatch = filename.match(/^(\d+)-/);
                if (!userIdMatch) {
                    console.log(`⚠️  Skipping ${filename} (invalid filename format)`);
                    skipped++;
                    continue;
                }

                const userId = parseInt(userIdMatch[1]);

                // Verify user exists
                const user = await User.findByPk(userId);
                if (!user) {
                    console.log(`⚠️  Skipping ${filename} (user ${userId} not found)`);
                    skipped++;
                    continue;
                }

                // Read file content
                const fileBuffer = fs.readFileSync(filePath);
                const extension = path.extname(filename);
                const contentType = extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.jpeg'
                    ? 'image/jpeg'
                    : 'application/octet-stream';

                // Store in MongoDB
                const result = await fileService.storeFile(fileBuffer, {
                    filename,
                    originalName: filename,
                    contentType,
                    uploadedBy: userId,
                    fileType: 'id-picture'
                });

                // Update user's id_picture_path to use MongoDB format
                if (user.id_picture_path && user.id_picture_path.includes(filename)) {
                    await user.update({
                        id_picture_path: `mongodb://${filename}`
                    });
                    console.log(`✅ Migrated ${filename} for user ${userId} and updated database reference`);
                } else {
                    console.log(`✅ Migrated ${filename} for user ${userId}`);
                }

                migrated++;

            } catch (error) {
                console.error(`❌ Error migrating ${filename}:`, error.message);
                errors++;
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`✅ Migrated: ${migrated} files`);
        console.log(`⏭️  Skipped: ${skipped} files`);
        console.log(`❌ Errors: ${errors} files`);

        if (migrated > 0) {
            console.log(`\n🎉 Migration completed successfully!`);
            console.log(`\n💡 You can now safely delete the uploads directory if all files were migrated successfully.`);
            console.log(`   Directory: ${UPLOADS_DIR}`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

// Run migration if called directly
if (require.main === module) {
    migrateFilesToMongoDB()
        .then(() => {
            console.log('\n✅ Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateFilesToMongoDB };
