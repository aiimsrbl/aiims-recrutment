'use strict';

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    status_type: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,

    },
    browser: {
        type: String
    },
    browser_version: {
        type: String
    },
    os: {
        type: String
    },
    os_version: {
        type: String
    },
    device: {
        type: String
    }
});

module.exports = mongoose.model('userlog', logSchema);
