'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bcryptSalt = require('../config/config').bcrypt.salt_rounds;

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    registration_completed: {
        type: Boolean,
        default: false
    },
    verification_status: {
        type: String,
        enum: ['NOT_VERIFIED', 'VERIFIED'],
        default: 'NOT_VERIFIED'
    },
    created_at: {
        type: Date,
        default: Date.now
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

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
    this.password = hash;
    next();
});

module.exports = mongoose.model('user', userSchema);
