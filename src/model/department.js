'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    description: {
        type: String
    },
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
});

module.exports = mongoose.model('department', departmentSchema);
