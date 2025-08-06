'use strict';

const error = require('../error');
const auth = require('../auth/authenticate');
const users = require('./users.js');

module.exports = function (app) {
    //get routes
    app.get('/api/profile', auth.checkApplicantUser, users.profile, error);

    // post routes
    app.post('/api/register', users.register, error);
    app.post('/api/verify-email', users.verifyEmail, error);
    app.post('/api/request-password-reset', users.requestResetPassword, error);
    app.post('/api/reset-password', users.resetPassword, error);
    app.post(
        '/api/change-password',
        auth.checkApplicantUser,
        users.changePassword,
        error
    );
    app.post(
        '/api/edit-profile',
        auth.checkApplicantUser,
        users.editProfile,
        error
    );
};
