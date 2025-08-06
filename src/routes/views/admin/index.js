'use strict';

const csrf = require('lusca');
const error = require('../../error');
const auth = require('../../auth/authenticate');
const views = require('./admin-views.js');

const csrfProtection = csrf.csrf();

module.exports = function (app) {
    //GET ROUTES

    app.get('/management/login', csrfProtection, views.login, error);
    app.get('/management/forgot-password', csrfProtection, views.forgotPassword, error);
    app.get('/management/reset-password', csrfProtection, views.resetPassword, error);
    app.get('/management/logout', views.logout, error);
    
    app.get('/management/dashboard', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.managementDashboard, error);
    app.get('/management/create/advertisement', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createAdvertisement, error);
    app.get('/management/advertisement/all', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.viewAllAdvertisement, error);
    app.get('/management/advertisement/delete/:id', csrfProtection, auth.checkManagementUser, views.deleteAdvertisement, error);

    app.get('/management/create/department', csrfProtection, auth.checkManagementUser, views.createDepartment, error);
    app.get('/management/department/all', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.viewAllDepartment, error);
    app.get('/management/department/delete/:id', csrfProtection, auth.checkManagementUser, views.deleteDepartment, error);

    app.get('/management/create/designation', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createDesignation, error);
    app.get('/management/designation/all', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.viewAllDesignation, error);
    app.get('/management/designation/delete/:id', csrfProtection, auth.checkManagementUser, views.deleteDesignation, error);

    app.get('/management/create/job-type', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createJobType, error);
    app.get('/management/job-type/all', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.viewAllJobType, error);
    app.get('/management/job-type/delete/:id', csrfProtection, auth.checkManagementUser, views.deleteJobType, error);

    app.get('/management/create/qualification', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createQualification, error);
    app.get('/management/qualification/all', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.viewAllQualification, error);
    app.get('/management/qualification/delete/:id', csrfProtection, auth.checkManagementUser, views.deleteQualification, error);

    app.get('/management/create/job', csrfProtection, auth.checkManagementUser, views.createJob,auth.checkRoles, error);
    app.get('/management/applicants/paid', csrfProtection, auth.checkManagementUser, auth.checkRoles,views.paidApplicants, error);
    app.get('/management/applicants/unpaid', csrfProtection, auth.checkManagementUser, auth.checkRoles,views.unPaidApplicants, error);
    app.get('/management/applicants/all', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.allApplicants, error);
    app.get('/management/view-applicant-form', csrfProtection, auth.checkManagementUser, views.viewApplicantsForm, error);
    app.get('/management/view-applicant-admit-card', csrfProtection, auth.checkManagementUser, views.viewApplicantsAdmitCard, error);
    app.get('/management/download-applicant-docs', csrfProtection, auth.checkManagementUser, views.downloadApplicantsDocs, error);
    app.get('/management/applicants/by/advertisement', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.viewAdvertisementApplicants, error);
    app.get('/management/applicants/paidByAdv', csrfProtection, auth.checkManagementUser, views.paidApplicantsByAdvRefNo, error);
    app.get('/management/applicants/elligbleByAdv', csrfProtection, auth.checkManagementUser, views.elligbleApplicantsByAdvRefNo, error);
    app.get('/management/download-attendence-sheet', csrfProtection, auth.checkManagementUser, views.downloadAttendenceSheet, error);


    app.get('/management/roles', csrfProtection, auth.checkManagementUser,auth.checkRoles,views.getAllroles, error);
    app.get('/management/roles/delete/:id', csrfProtection, auth.checkManagementUser, views.deleteRole, error);
    app.get('/management/roles/:id', csrfProtection, auth.checkManagementUser, views.getRolebyId, error);
    app.get('/management/user-logs', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.getUserlogs, error);


    //POST ROUTES
    app.post('/management/login', csrfProtection, views.loginPost, error);
    app.post('/management/forgot-password', csrfProtection, views.forgotPasswordPost, error);
    app.post('/management/reset-password', csrfProtection, views.resetPasswordPost, error);

    app.post('/management/create/advertisement', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createAdvertisementPost, error);
    app.post('/management/create/job', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createJobPost, error);

    app.post('/management/create/department', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createDepartmentPost, error);
    app.post('/management/create/designation', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createDesignationPost, error);
    app.post('/management/create/job-type', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createJobTypePost, error);
    app.post('/management/create/qualification', csrfProtection, auth.checkManagementUser,auth.checkRoles, views.createQualificationPost, error);
    app.post('/management/applicants/elligibile-status', auth.checkManagementUser, views.setElligibilityStatus, error);
    app.post('/management/advertisement/generate-roll-numbers', auth.checkManagementUser, views.generateRollNumbers, error);
    app.post('/management/applicants/generate-admit-card', auth.checkManagementUser, views.generateAdmitCards, error);
    app.post('/management/applicants/generate-interview-letter', auth.checkManagementUser, views.generateInterviewLetters, error);
    app.post('/management/applicants/send-email', auth.checkManagementUser, views.sendMails, error);



};
