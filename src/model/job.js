'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const jobSchema = new mongoose.Schema({
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'user'
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'user'
    }
}, { strict: false });

module.exports = mongoose.model('job', jobSchema);
