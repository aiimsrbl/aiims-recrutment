'use strict';

const csrf = require('lusca');
const error = require('../../error');
const auth = require('../../auth/authenticate');
const views = require('./views.js');

const csrfProtection = csrf.csrf();


module.exports = function (app) {
    //GET ROUTES

    app.get('/', views.home, error);
    app.get('/login', csrfProtection, views.login, error);
    app.get('/forgot-password', csrfProtection, views.forgotPassword, error);
    app.get('/reset-password', csrfProtection, views.resetPassword, error);
    app.get(
        '/change-password',
        csrfProtection,
        auth.checkApplicantUser,
        views.changePassword,
        error
    );
    app.get('/logout', views.logout, error);
    app.get('/register', csrfProtection, views.register, error);
    app.get('/verify-email', csrfProtection, views.verifyEmail, error);

    app.get(
        '/application-form',
        csrfProtection,
        auth.checkApplicantUser,
        views.applicationForm,
        error
    );
    app.get(
        '/edit-application-form',
        csrfProtection,
        auth.checkApplicantUser,
        views.editApplicationForm,
        error
    );
    app.get(
        '/edit-profile',
        csrfProtection,
        auth.checkApplicantUser,
        views.editProfile,
        error
    );

    app.get(
        '/application-success',
        auth.checkApplicantUser,
        views.applicationSuccess,
        error
    );

    app.get(
        '/print-application-form',
        auth.checkApplicantUser,
        views.printApplicationForm,
        error
    );

    app.get(
        '/print-admit-card',
        auth.checkApplicantUser,
        views.printAdmitCard,
        error
    );

    app.get(
        '/profile',
        auth.checkApplicantUser,
        views.profile,
        error
    );

    app.get(
        '/my-jobs',
        auth.checkApplicantUser,
        views.myJobs,
        error
    );

    //POST ROUTES
    app.post('/login', csrfProtection, views.loginPost, error);
    app.post('/register', csrfProtection, views.registerPost, error);
    app.post(
        '/forgot-password',
        csrfProtection,
        views.forgotPasswordPost,
        error
    );
    app.post(
        '/change-password',
        csrfProtection,
        auth.checkApplicantUser,
        views.changePasswordPost,
        error
    );
    app.post('/reset-password', csrfProtection, views.resetPasswordPost, error);
    app.post('/edit-profile', csrfProtection, views.editProfilePost, error);

    app.post(
        '/application-form',
        csrfProtection,
        auth.checkApplicantUser,
        views.applicationFormPost,
        error
    );

    app.post('/application/payment/verification', auth.checkApplicantUser, views.verifyPayment, error);
    
    app.post('/check-duplicate-application', auth.checkApplicantUser, views.checkDuplicateApplication, error);

    // initate sbiepay payment
    app.post('/api/sbiepay/payment/initiate', auth.checkApplicantUser, views.intitate, error);
    app.post('/api/sbiepayresponse', views.fetchPaymentStatus, error);
    //  sbi-epay double verification
    app.get('/api/doubleVerification', auth.checkApplicantUser, views.doubleVarification, error);
};
