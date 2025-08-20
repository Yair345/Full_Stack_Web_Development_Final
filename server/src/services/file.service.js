const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const File = require('../models/File.model');
const { AppError } = require('../utils/error.utils');

class FileService {
    constructor() {
        this.gridFS = null;
        this.initialized = false;
    }

    // Initialize GridFS bucket
    async initialize() {
        if (this.initialized) return;

        try {
            if (!mongoose.connection.db) {
                throw new Error('MongoDB connection not established');
            }

            this.gridFS = new GridFSBucket(mongoose.connection.db, {
                bucketName: 'uploads'
            });

            this.initialized = true;
            console.log('✅ FileService GridFS initialized');
        } catch (error) {
            console.error('❌ FileService initialization error:', error);
            throw new AppError('File service initialization failed', 500);
        }
    }

    // Store file in MongoDB GridFS
    async storeFile(fileBuffer, metadata) {
        await this.initialize();

        const { filename, originalName, contentType, uploadedBy, fileType } = metadata;

        try {
            // Create GridFS upload stream
            const uploadStream = this.gridFS.openUploadStream(filename, {
                metadata: {
                    originalName,
                    contentType,
                    uploadedBy,
                    fileType,
                    uploadedAt: new Date()
                }
            });

            // Store file metadata in our File model
            const fileDoc = new File({
                filename,
                originalName,
                contentType,
                size: fileBuffer.length,
                uploadedBy,
                fileType,
                gridFSFileId: uploadStream.id
            });

            // Upload file to GridFS
            await new Promise((resolve, reject) => {
                uploadStream.end(fileBuffer, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            // Save file metadata
            await fileDoc.save();

            return {
                fileId: fileDoc._id,
                gridFSFileId: uploadStream.id,
                filename,
                size: fileBuffer.length
            };

        } catch (error) {
            console.error('Error storing file:', error);
            throw new AppError('Failed to store file', 500);
        }
    }

    // Retrieve file from MongoDB GridFS
    async getFile(filename) {
        await this.initialize();

        try {
            // Find file metadata
            const fileDoc = await File.findOne({ filename });
            if (!fileDoc) {
                throw new AppError('File not found', 404);
            }

            // Update last accessed time
            fileDoc.lastAccessedAt = new Date();
            await fileDoc.save();

            // Create download stream from GridFS
            const downloadStream = this.gridFS.openDownloadStream(fileDoc.gridFSFileId);

            return {
                stream: downloadStream,
                metadata: {
                    filename: fileDoc.filename,
                    originalName: fileDoc.originalName,
                    contentType: fileDoc.contentType,
                    size: fileDoc.size,
                    uploadedBy: fileDoc.uploadedBy,
                    fileType: fileDoc.fileType,
                    uploadedAt: fileDoc.uploadedAt
                }
            };

        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error retrieving file:', error);
            throw new AppError('Failed to retrieve file', 500);
        }
    }

    // Delete file from MongoDB GridFS
    async deleteFile(filename) {
        await this.initialize();

        try {
            // Find file metadata
            const fileDoc = await File.findOne({ filename });
            if (!fileDoc) {
                return; // File doesn't exist, nothing to delete
            }

            // Delete from GridFS
            await this.gridFS.delete(fileDoc.gridFSFileId);

            // Delete metadata document
            await File.deleteOne({ _id: fileDoc._id });

            console.log(`File deleted successfully: ${filename}`);

        } catch (error) {
            console.error('Error deleting file:', error);
            throw new AppError('Failed to delete file', 500);
        }
    }

    // Delete old file by user ID and file type (for replacing files)
    async deleteUserFile(userId, fileType) {
        await this.initialize();

        try {
            const fileDoc = await File.findOne({ uploadedBy: userId, fileType });
            if (fileDoc) {
                await this.deleteFile(fileDoc.filename);
            }
        } catch (error) {
            console.error('Error deleting user file:', error);
            // Don't throw error here, as it's just cleanup
        }
    }

    // Get file list by user
    async getUserFiles(userId, fileType = null) {
        try {
            const query = { uploadedBy: userId };
            if (fileType) {
                query.fileType = fileType;
            }

            const files = await File.find(query)
                .select('filename originalName contentType size fileType uploadedAt lastAccessedAt')
                .sort({ uploadedAt: -1 });

            return files;

        } catch (error) {
            console.error('Error getting user files:', error);
            throw new AppError('Failed to get user files', 500);
        }
    }

    // Check if file exists
    async fileExists(filename) {
        try {
            const fileDoc = await File.findOne({ filename });
            return !!fileDoc;
        } catch (error) {
            return false;
        }
    }

    // Get file statistics
    async getFileStats() {
        await this.initialize();

        try {
            const totalFiles = await File.countDocuments();
            const totalSize = await File.aggregate([
                { $group: { _id: null, totalSize: { $sum: '$size' } } }
            ]);

            const filesByType = await File.aggregate([
                { $group: { _id: '$fileType', count: { $sum: 1 }, totalSize: { $sum: '$size' } } }
            ]);

            return {
                totalFiles,
                totalSize: totalSize.length > 0 ? totalSize[0].totalSize : 0,
                filesByType
            };

        } catch (error) {
            console.error('Error getting file stats:', error);
            throw new AppError('Failed to get file statistics', 500);
        }
    }
}

// Create singleton instance
const fileService = new FileService();

module.exports = fileService;
