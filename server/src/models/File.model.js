const mongoose = require('mongoose');

// File Schema for MongoDB file storage
const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        unique: true
    },
    originalName: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: Number, // User ID from MySQL
        required: true
    },
    fileType: {
        type: String,
        enum: ['id-picture', 'document', 'profile-picture'],
        required: true
    },
    gridFSFileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
fileSchema.index({ uploadedBy: 1, fileType: 1 });
fileSchema.index({ filename: 1 });
fileSchema.index({ gridFSFileId: 1 });

const File = mongoose.model('File', fileSchema);

module.exports = File;
