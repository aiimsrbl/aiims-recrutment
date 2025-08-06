'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const ec = require('../lib/errorConsts');
const mail = require('../utils/mail');
const User = require('../model/users');
const Token = require('../model/token');
const config = require('../config/config');
const mailFormats = require('../lib/mailFormats');

let users = {
    register: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no regietration data'
                })
            );
        }

        let user = await User.findOne({ email: params.email });
        if (user) {
            return cb(
                ec.appError({
                    status: ec.USER_EXISTS,
                    message: 'User with same email already exists.'
                })
            );
        }

        user = await User.findOne({ phone: params.phone });
        if (user) {
            return cb(
                ec.appError({
                    status: ec.USER_EXISTS,
                    message: 'User with same phone number already exists.'
                })
            );
        }

        User.create(params, async function (err, result) {
            if (err) {
                console.log(err);
                return cb(
                    ec.appError({
                        status: ec.DB_ERROR,
                        message: 'DB Error'
                    })
                );
            }

            let emailVerifyToken = crypto
                .randomBytes(config.crypto.byte_length)
                .toString('hex');

            let hash = await bcrypt.hash(
                emailVerifyToken,
                Number(config.bcrypt.salt_rounds)
            );

            await new Token({
                user_id: result._id,
                token: hash,
                type: 'EMAIL_VERIFICATION',
                created_at: Date.now()
            }).save();

            let emailVerifyLink =
                config.protocol +
                '://' +
                config.website_url +
                '/verify-email?token=' +
                emailVerifyToken +
                '&id=' +
                result._id;

            params['emailVerifyLink'] = emailVerifyLink;
            let mailParams = {
                to: params.email,
                subject: 'Welcome to Recruitment app',
                html: mailFormats.welcome(params)
            };

            mail.send(mailParams, function (error, info) {
                if (error) {
                    console.log('Error in sending welcome mail');
                    console.log(error);
                } else {
                    console.log('Welcome email sent: ' + info.response);
                }

                return cb(err, result);
            });
        });
    },

    verifyEmail: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no email provided'
                })
            );
        }

        let emailVerifyToken = await Token.findOne({
            user_id: params.id,
            type: 'EMAIL_VERIFICATION'
        });

        if (!emailVerifyToken) {
            return cb(
                ec.appError({
                    status: ec.INVALID_TOKEN,
                    message: 'Invalid or expired token.'
                })
            );
        }

        let isValid = await bcrypt.compare(
            params.token,
            emailVerifyToken.token
        );

        if (!isValid) {
            return cb(
                ec.appError({
                    status: ec.INVALID_TOKEN,
                    message: 'Invalid or expired token.'
                })
            );
        }

        await User.updateOne(
            { _id: params.id },
            { $set: { verification_status: 'VERIFIED' } },
            { new: true }
        );

        await User.findById({ _id: params.id });

        await emailVerifyToken.deleteOne();

        return cb();
    },

    requestResetPassword: async function (email, cb) {
        if (!email) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no email provided'
                })
            );
        }

        let user = await User.findOne({ email });

        if (!user) {
            return cb(
                ec.appError({
                    status: ec.USER_EXISTS,
                    message: 'Email does not exists.'
                })
            );
        }

        let token = await Token.findOne({
            user_id: user._id,
            type: 'PASSWORD_RESET'
        });
        if (token) {
            await token.deleteOne();
        }

        let resetToken = crypto
            .randomBytes(config.crypto.byte_length)
            .toString('hex');
        let hash = await bcrypt.hash(
            resetToken,
            Number(config.bcrypt.salt_rounds)
        );

        await new Token({
            user_id: user._id,
            token: hash,
            type: 'PASSWORD_RESET',
            created_at: Date.now()
        }).save();

        let resetLink;

        if(user.role === 'MANAGEMENT') {
            resetLink =
                config.protocol +
                '://' +
                config.website_url +
                '/management/reset-password?token=' +
                resetToken +
                '&id=' +
                user._id;
        } else {
            resetLink =
                config.protocol +
                '://' +
                config.website_url +
                '/reset-password?token=' +
                resetToken +
                '&id=' +
                user._id;
        }

        let mailParams = {
            to: email,
            subject: 'Recruitment App Reset Password',
            html: mailFormats.resetPassword({ resetLink })
        };

        mail.send(mailParams, function (error, info) {
            if (error) {
                console.log('Error in sending password reset mail');
                console.log(error);
            } else {
                console.log('Password reset email sent: ' + info.response);
            }

            return cb();
        });
    },

    resetPassword: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no email provided'
                })
            );
        }

        let passwordResetToken = await Token.findOne({
            user_id: params.id,
            type: 'PASSWORD_RESET'
        });

        if (!passwordResetToken) {
            return cb(
                ec.appError({
                    status: ec.INVALID_TOKEN,
                    message: 'Invalid or expired password reset token.'
                })
            );
        }

        let isValid = await bcrypt.compare(
            params.token,
            passwordResetToken.token
        );

        if (!isValid) {
            return cb(
                ec.appError({
                    status: ec.INVALID_TOKEN,
                    message: 'Invalid or expired password reset token.'
                })
            );
        }

        let hash = await bcrypt.hash(
            params.password,
            Number(config.bcrypt.salt_rounds)
        );

        await User.updateOne(
            { _id: params.id },
            { $set: { password: hash } },
            { new: true }
        );

        let user = await User.findById({ _id: params.id });

        let mailParams = {
            to: user.email,
            subject: 'Recruitment App Password Changed',
            html: mailFormats.changedPassword({ user })
        };

        await passwordResetToken.deleteOne();

        mail.send(mailParams, function (error, info) {
            if (error) {
                console.log('Error in sending password changed mail');
                console.log(error);
            } else {
                console.log('Password changed email sent: ' + info.response);
            }

            return cb();
        });
    },

    changePassword: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no data provided'
                })
            );
        }

        let user = await User.findOne({ _id: params.userId });

        if (!user) {
            return cb(
                ec.appError({
                    status: ec.USER_EXISTS,
                    message: 'User does not exists.'
                })
            );
        }

        let isValid = await bcrypt.compare(params.oldPassword, user.password);

        if (!isValid) {
            return cb(
                ec.appError({
                    status: ec.UNAUTHORIZED_ACCESS,
                    message: 'Invalid old password provided.'
                })
            );
        }

        let hash = await bcrypt.hash(
            params.newPassword,
            Number(config.bcrypt.salt_rounds)
        );

        await User.updateOne(
            { _id: user._id },
            { $set: { password: hash } },
            { new: true }
        );

        let mailParams = {
            to: user.email,
            subject: 'Records Password Changed',
            html: mailFormats.changedPassword(user)
        };

        mail.send(mailParams, function (error, info) {
            if (error) {
                console.log('Error in sending password changed mail');
                console.log(error);
            } else {
                console.log('Password changed email sent: ' + info.response);
            }

            return cb();
        });
    },

    editProfile: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no data provided'
                })
            );
        }

        let editData = {
            name: params.name,
            company: params.company,
            phone: params.phone,
            country: params.country
        };

        await User.updateOne(
            { _id: params.id },
            { $set: editData },
            { new: true }
        );

        let mailParams = {
            to: params.email,
            subject: 'Profile Details Changed',
            html: mailFormats.editProfile(params)
        };

        mail.send(mailParams, function (error, info) {
            if (error) {
                console.log('Error in sending password changed mail');
                console.log(error);
            } else {
                console.log('Password changed email sent: ' + info.response);
            }

            return cb();
        });
    },

    fetchById: function (userId, cb) {
        if (!userId) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no userId data'
                })
            );
        }

        User.find(
            { _id: userId },
            { password: 0, updated_at: 0, __v: 0 },
            function (err, userData) {
                if (err) {
                    return cb(err);
                }

                return cb(err, userData[0]);
            }
        );
    }
};

module.exports = users;
