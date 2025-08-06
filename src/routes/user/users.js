'use strict';

const ec = require('../../lib/errorConsts');
const usersApi = require('../../api/users');
const { userSchema } = require('../../lib/joiSchemas');

const excludeDomains = [];

let user = {
    register: async function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        req.body.role = 'APPLICANT'

        var joiRes = userSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        })
        
        if (joiRes.error) {
            return next(joiRes.error);
        }

        usersApi.register(joiRes.value, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Registration successful'
            });
        });
    },

    verifyEmail: async function (req, res, next) {
        if (
            !req.body ||
            !req.body.token ||
            !req.body.id
        ) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        usersApi.verifyEmail(req.body, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Email Verified successfully'
            });
        });
    },

    requestResetPassword: async function (req, res, next) {
        if (!req.body || !req.body.email) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        usersApi.requestResetPassword(req.body.email, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Email sent successful'
            });
        });
    },

    resetPassword: async function (req, res, next) {
        if (
            !req.body ||
            !req.body.token ||
            !req.body.id ||
            !req.body.password
        ) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        usersApi.resetPassword(req.body, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Password reset successful'
            });
        });
    },

    changePassword: async function (req, res, next) {
        if (
            !req.body ||
            !req.body.old_password ||
            !req.body.password ||
            !req.body.confirm_password
        ) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        if (req.body.password !== req.body.confirm_password) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'Passwords do not match.'
                })
            );
        }

        let params = {
            oldPassword: req.body.old_password,
            newPassword: req.body.password,
            userId: req.user.id
        };

        usersApi.changePassword(params, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Password changed successfully'
            });
        });
    },

    profile: function (req, res, next) {
        if (!req.user) {
            return next(
                ec.appError({
                    status: ec.UNAUTHORIZED_ACCESS,
                    message: 'No data provided.'
                })
            );
        }

        usersApi.fetchById(req.user.id, function (err, userData) {
            if (err) {
                return next(err);
            }

            res.json({
                success: true,
                data: userData
            });
        });
    },

    editProfile: function (req, res, next) {
        if (!req.user) {
            return next(
                ec.appError({
                    status: ec.UNAUTHORIZED_ACCESS,
                    message: 'No data provided.'
                })
            );
        }

        let params = {
            id: req.user.id,
            email: req.user.email,
            name: req.body.name,
            company: req.body.company,
            phone: req.body.phone,
            country: req.body.country
        };

        usersApi.editProfile(params, function (err, userData) {
            if (err) {
                return next(err);
            }

            res.json({
                success: true,
                data: userData
            });
        });
    }
};

module.exports = user;
