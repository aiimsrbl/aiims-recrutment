'use strict';

const error = require('../error');
const auth = require('../auth/authenticate');
const dashboard = require('./dashboard.js');
const advertisement = require('./advertisement.js');
const job = require('./job.js');

const department = require('./department.js');
const designation = require('./designation.js');
const jobType = require('./job-type.js');
const qualification = require('./qualification.js');
const application = require('./application.js');
const roleController = require('./role.js');
const logController = require('./user-logs.js');

module.exports = function (app) {
    //get routes
    app.get('/api/dashboard', auth.checkApplicantUser, dashboard.home, error);


    app.get('/api/management/advertisement/fetch/all', auth.checkManagementUser, advertisement.fetchAll, error);
    app.get('/api/management/advertisement/fetch/active', advertisement.fetchActive, error);
    app.get('/api/management/advertisement/fetch/:id', advertisement.fetchById, error);
    app.get('/api/management/department/fetch/all', auth.checkManagementUser, department.fetchAll, error);
    app.get('/api/management/department/fetch/active', auth.checkManagementUser, department.fetchActive, error);
    app.get('/api/management/designation/fetch/all', auth.checkManagementUser, designation.fetchAll, error);
    app.get('/api/management/designation/fetch/active', auth.checkManagementUser, designation.fetchActive, error);
    app.get('/api/management/job-type/fetch/all', auth.checkManagementUser, jobType.fetchAll, error);
    app.get('/api/management/job-type/fetch/active', auth.checkManagementUser, jobType.fetchActive, error);
    app.get('/api/management/qualification/fetch/all', auth.checkManagementUser, qualification.fetchAll, error);
    app.get('/api/management/qualification/fetch/active', auth.checkManagementUser, qualification.fetchActive, error);

    app.get('/api/applicant/application/fetch/:id', auth.checkApplicantUser, application.fetchById, error);

    app.get('/api/sidebar/menu',roleController.getRole, error);
    app.get('/api/role/get', auth.checkManagementUser, roleController.fetchAll, error);
    app.get('/api/user/logs', auth.checkManagementUser, logController.fetchAll, error);

    //post routes
    app.post('/api/management/create/advertisement', auth.checkManagementUser, advertisement.create, error);
    app.post('/api/management/create/job', auth.checkManagementUser, job.create, error);
    app.post('/api/management/create/department', auth.checkManagementUser, department.create, error);
    app.post('/api/management/create/designation', auth.checkManagementUser, designation.create, error);
    app.post('/api/management/create/job-type', auth.checkManagementUser, jobType.create, error);
    app.post('/api/management/create/qualification', auth.checkManagementUser, qualification.create, error);

    app.post('/api/management/advertisement/delete', auth.checkManagementUser, advertisement.delete, error);
    app.post('/api/management/department/delete', auth.checkManagementUser, department.delete, error);
    app.post('/api/management/designation/delete', auth.checkManagementUser, designation.delete, error);
    app.post('/api/management/job-type/delete', auth.checkManagementUser, jobType.delete, error);
    app.post('/api/management/qualification/delete', auth.checkManagementUser, qualification.delete, error);
    app.post('/api/applicant/application/create', auth.checkApplicantUser, application.create, error);
    app.post('/api/applicant/application/edit', auth.checkApplicantUser, application.edit, error);
    app.post('/api/applicant/application/update', auth.checkApplicantUser, application.update, error);


    app.post('/api/role/create', auth.checkManagementUser, roleController.createRole, error);
    app.post('/api/role/update', auth.checkManagementUser, roleController.updateRole, error);
    app.post('/api/role/delete', auth.checkManagementUser, roleController.deleteRole, error);
    app.post('/api/management/role/delete', auth.checkManagementUser, roleController.delete, error);
    app.post('/api/management/roleByid', auth.checkManagementUser, roleController.getRolebyId, error);


};
