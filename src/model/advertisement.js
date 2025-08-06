'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const advertisementSchema = new mongoose.Schema({
    refrence_number: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    published_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    description: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
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

module.exports = mongoose.model('advertisement', advertisementSchema);
