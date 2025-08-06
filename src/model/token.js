'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tokenSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['PASSWORD_RESET', 'EMAIL_VERIFICATION'],
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 3600 // expiry time in seconds
    }
});

module.exports = mongoose.model('token', tokenSchema);