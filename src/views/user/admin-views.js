'use strict';

const needle = require('needle');
const passport = require('passport');
const path = require('path');
const moment = require('moment');
const JSZip = require('jszip');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const Applications = require('../../../model/application');
const mail = require('../../../utils/mail');
const mailFormats = require('../../../lib/mailFormats');
const config = require('../../../config/config');

let views = {

    login: function (req, res) {
        if (req.user) {
            if (req.user.role !== 'MANAGEMENT') {
                return res.redirect('/logout');
            }
            return res.redirect('/management/dashboard');
        }
        res.render('admin/login.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    forgotPassword: function (req, res) {
        if (req.user) {
            return res.redirect('/');
        }
        res.render('admin/forgot-password.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    loginPost: function (req, res, next) {
        req.body.role = 'MANAGEMENT';
        passport.authenticate('local', function (err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.render('admin/login.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    msg: 'Invalid email or password.'
                });
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/management/dashboard');
            });
        })(req, res, next);
    },

    forgotPasswordPost: function (req, res) {
        let needleOptions = {
            gzip: true,
            headers: req.headers
        };
        let requestData = [
            needle(
                'POST',
                req.protocol +
                '://' +
                req.get('host') +
                '/api/request-password-reset',
                req.body,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/forgot-password.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Password Reset Failed! ' + data[0].body.error
                    });
                }
                res.render('admin/forgot-password.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    msg: 'Email with password reset link sent successfully. Please check your mail.'
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/forgot-password.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Password Reset Failed!. Internal Server Error.'
                });
            });
    },

    logout: function (req, res) {
        if (req.user) {
            req.logout(function (err) {
                if (err) { console.log(err); }
                req.session.destroy(function (err) {
                    if (err) console.log(err);
                    res.redirect('/');
                });
            });
        } else {
            res.redirect('/');
        }
    },

    resetPassword: function (req, res) {
        if (req.user) {
            return res.redirect('/');
        }
        res.render('admin/reset-password.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    resetPasswordPost: function (req, res) {
        let reqBody = {
            token: req.query.token,
            id: req.query.id,
            password: req.body.password,
            confirm_password: req.body.confirmPassword
        };
        if (reqBody.password !== reqBody.confirm_password) {
            res.render('admin/reset-password.ejs', {
                _csrf: req.csrfToken(),
                post: true,
                success: false,
                msg: 'Password Reset Failed!. Password and Confirm Password do not match.'
            });
        }
        let needleOptions = {
            gzip: true,
            headers: req.headers
        };
        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/reset-password',
                reqBody,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/reset-password.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Password Reset Failed! ' + data[0].body.error
                    });
                }
                res.render('admin/reset-password.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    msg: 'Password reset successfull. Please login.'
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/reset-password.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Password reset Failed!. Internal Server Error.'
                });
            });
    },

    managementDashboard: function (req, res) {
        let needleOptions = {
            gzip: true,
            headers: req.headers
        };
        res.render('admin/admin-dashboard.ejs');
        // let requestData = [
        //     needle(
        //         'GET',
        //         req.protocol + '://' + req.get('host') + '/api/profile',
        //         req.body,
        //         needleOptions
        //     )
        // ];

        // Promise.all(requestData)
        //     .then((data) => {
        //         if (data[0].body.error) {
        //             return res.render('profile.ejs', {
        //                 _csrf: req.csrfToken(),
        //                 success: false,
        //                 msg: data[0].body.error
        //             });
        //         }
        //         res.render('profile.ejs', {
        //             _csrf: req.csrfToken(),
        //             user: data[0].body || []
        //         });
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //         res.render('dashboard.ejs', {
        //             _csrf: req.csrfToken(),
        //             success: false,
        //             msg: 'Internal Server Error.'
        //         });
        //     });
    },

    createAdvertisement: function (req, res) {
        res.render('admin/create-advertisement.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    createAdvertisementPost: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers,
            multipart: true
        };

        var data = { ...req.body};

        if (req.files?.file) {

            const allowedExt = ['.docx', '.doc', '.pdf'];

            if (allowedExt.indexOf(path.extname(req.files?.file?.name)) < 0) {
                return res.render('admin/create-advertisement.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot create advertisement. Invalid File type.'
                });
            }

            if (req.files?.file?.size > 2000000) {
                return res.render('admin/create-advertisement.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot create advertisement. File should be less than 2MB.'
                });
            }

            data.file = req.files.file.data;
        }

        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/management/create/advertisement',
                data,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/create-advertisement.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot create advertisement. ' + data[0].body.error
                    });
                }
                res.render('admin/create-advertisement.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    msg: 'Advertisement created successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/create-advertisement.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot create advertisement. Internal Server Error.'
                });
            });
    },

    viewAllAdvertisement: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/advertisement/fetch/all',
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/view-advertisement.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                    });
                }
                res.render('admin/view-advertisement.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    adv: data[0].body
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/view-advertisement.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    deleteAdvertisement: function (req, res) {

        let id = req.params.id;

        if(!id || !id.length){
            res.json({
                success: false,
                msg: 'Invalid Id.'
            });
        }

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [

            needle(
                'Post',
                req.protocol + '://' + req.get('host') + '/api/management/advertisement/delete',
                {id},
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.json({
                        success: false,
                        msg: data[0].body.error
                    });
                }
                return res.json({
                    success: true,
                    msg: 'Advertisement Deleted successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                return res.json({
                    success: false,
                    msg: 'Internal Serever Error.'
                });
            });
    },

    createJob: function (req, res) {

        let post = req.query.post;
        let msg = req.query.msg;

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/advertisement/fetch/active',
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/create-job.ejs', {
                        _csrf: req.csrfToken(),
                        post,
                        success: msg,
                        adv: [],
                        msg: 'Failed! Cannot retrive adata. Please try again after some time. ' + data[0].body.error
                    });
                }
                res.render('admin/create-job.ejs', {
                    _csrf: req.csrfToken(),
                    post: post,
                    success: msg,
                    adv: data[0].body,
                    msg
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/create-job.ejs', {
                    _csrf: req.csrfToken(),
                    post: false,
                    success: false,
                    adv: [],
                    msg: 'Failed! Cannot retrive data at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    createJobPost: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers,
            multipart: true
        };

        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/management/create/job',
                req.body,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.redirect('/management/create/job?post=true&msg=error');
                }
                return res.redirect('/management/create/job?post=true&msg=success');
            })
            .catch((err) => {
                console.log(err);
                return res.redirect('/management/create/job?post=true&msg=error');
            });
    },

    createDepartment: function (req, res) {
        res.render('admin/create-department.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    createDepartmentPost: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers,
            multipart: true
        };

        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/management/create/department',
                req.body,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/create-department.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot create department. ' + data[0].body.error
                    });
                }
                res.render('admin/create-department.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    msg: 'Department created successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/create-department.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot create department. Internal Server Error.'
                });
            });
    },

    viewAllDepartment: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/department/fetch/all',
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/view-department.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot retrive department at the moment. Please try again after some time. ' + data[0].body.error
                    });
                }
                res.render('admin/view-department.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    department: data[0].body
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/view-department.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot retrive department at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    deleteDepartment: function (req, res) {

        let id = req.params.id;

        if(!id || !id.length){
            res.json({
                success: false,
                msg: 'Invalid Id.'
            });
        }

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [

            needle(
                'Post',
                req.protocol + '://' + req.get('host') + '/api/management/department/delete',
                {id},
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.json({
                        success: false,
                        msg: data[0].body.error
                    });
                }
                return res.json({
                    success: true,
                    msg: 'Department Deleted successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                return res.json({
                    success: false,
                    msg: 'Internal Serever Error.'
                });
            });
    },

    createDesignation: function (req, res) {
        res.render('admin/create-designation.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    createDesignationPost: function (req, res) {
        
            let needleOptions = {
                gzip: true,
                headers: req.headers,
                multipart: true
            };
    
            let requestData = [
                needle(
                    'POST',
                    req.protocol + '://' + req.get('host') + '/api/management/create/designation',
                    req.body,
                    needleOptions
                )
            ];
    
            Promise.all(requestData)
                .then((data) => {
                    if (data[0].body.error) {
                        return res.render('admin/create-designation.ejs', {
                            _csrf: req.csrfToken(),
                            post: true,
                            success: false,
                            msg: 'Failed! Cannot create designation. ' + data[0].body.error
                        });
                    }
                    res.render('admin/create-designation.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: true,
                        msg: 'Designation created successfully.'
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.render('admin/create-designation.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot create designation. Internal Server Error.'
                    });
                });
    },

    viewAllDesignation: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/designation/fetch/all',
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/view-designation.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot retrive designation at the moment. Please try again after some time. ' + data[0].body.error
                    });
                }
                res.render('admin/view-designation.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    designation: data[0].body
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/view-designation.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot retrive designation at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    deleteDesignation: function (req, res) {

        let id = req.params.id;

        if(!id || !id.length){
            res.json({
                success: false,
                msg: 'Invalid Id.'
            });
        }

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [

            needle(
                'Post',
                req.protocol + '://' + req.get('host') + '/api/management/designation/delete',
                {id},
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.json({
                        success: false,
                        msg: data[0].body.error
                    });
                }
                return res.json({
                    success: true,
                    msg: 'Designation Deleted successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                return res.json({
                    success: false,
                    msg: 'Internal Serever Error.'
                });
            });
    },

    createJobType: function (req, res) {
        res.render('admin/create-job-type.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    createJobTypePost: function (req, res) {
        
            let needleOptions = {
                gzip: true,
                headers: req.headers,
                multipart: true
            };
    
            let requestData = [
                needle(
                    'POST',
                    req.protocol + '://' + req.get('host') + '/api/management/create/job-type',
                    req.body,
                    needleOptions
                )
            ];
    
            Promise.all(requestData)
                .then((data) => {
                    if (data[0].body.error) {
                        return res.render('admin/create-job-type.ejs', {
                            _csrf: req.csrfToken(),
                            post: true,
                            success: false,
                            msg: 'Failed! Cannot create job type. ' + data[0].body.error
                        });
                    }
                    res.render('admin/create-job-type.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: true,
                        msg: 'Job Type created successfully.'
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.render('admin/create-job-type.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot create job type. Internal Server Error.'
                    });
                });
    },

    viewAllJobType: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/job-type/fetch/all',
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/view-job-type.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot retrive job type at the moment. Please try again after some time. ' + data[0].body.error
                    });
                }
                res.render('admin/view-job-type.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    jobType: data[0].body
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/view-job-type.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot retrive job type at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    deleteJobType: function (req, res) {

        let id = req.params.id;

        if(!id || !id.length){
            res.json({
                success: false,
                msg: 'Invalid Id.'
            });
        }

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [

            needle(
                'Post',
                req.protocol + '://' + req.get('host') + '/api/management/job-type/delete',
                {id},
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.json({
                        success: false,
                        msg: data[0].body.error
                    });
                }
                return res.json({
                    success: true,
                    msg: 'Job Type Deleted successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                return res.json({
                    success: false,
                    msg: 'Internal Serever Error.'
                });
            });
    },

    createQualification: function (req, res) {
        res.render('admin/create-qualification.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    createQualificationPost: function (req, res) {

            let needleOptions = {
                gzip: true,
                headers: req.headers,
                multipart: true
            };
    
            let requestData = [
                needle(
                    'POST',
                    req.protocol + '://' + req.get('host') + '/api/management/create/qualification',
                    req.body,
                    needleOptions
                )
            ];
    
            Promise.all(requestData)
                .then((data) => {
                    if (data[0].body.error) {
                        return res.render('admin/create-qualification.ejs', {
                            _csrf: req.csrfToken(),
                            post: true,
                            success: false,
                            msg: 'Failed! Cannot create qualification. ' + data[0].body.error
                        });
                    }
                    res.render('admin/create-qualification.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: true,
                        msg: 'Qualification created successfully.'
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.render('admin/create-qualification.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot create qualification. Internal Server Error.'
                    });
                });
    },

    viewAllQualification: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/qualification/fetch/all',
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/view-qualification.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot retrive qualification at the moment. Please try again after some time. ' + data[0].body.error
                    });
                }
                res.render('admin/view-qualification.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    qualification: data[0].body
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/view-qualification.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot retrive qualification at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    deleteQualification: function (req, res) {

        let id = req.params.id;

        if(!id || !id.length){
            res.json({
                success: false,
                msg: 'Invalid Id.'
            });
        }

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [

            needle(
                'Post',
                req.protocol + '://' + req.get('host') + '/api/management/qualification/delete',
                {id},
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.json({
                        success: false,
                        msg: data[0].body.error
                    });
                }
                return res.json({
                    success: true,
                    msg: 'Qualification Deleted successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                return res.json({
                    success: false,
                    msg: 'Internal Serever Error.'
                });
            });
    },

    paidApplicants: function (req, res) {

        Applications.find({paymentStatus:'SUCCESS'}, function (err, result) {

            if (err) {
                return res.render('admin/view-paid-applicants.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    data:[],
                    // msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                });
            }
            res.render('admin/view-paid-applicants.ejs', {
                _csrf: req.csrfToken(),
                post: true,
                success: true,
                data: result,
            });
        });
    },

    unPaidApplicants: function (req, res) {

        Applications.find({paymentStatus:'PENDING'}, function (err, result) {

            if (err) {
                return res.render('admin/view-unpaid-applicants.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    data:[],
                    // msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                });
            }
            res.render('admin/view-unpaid-applicants.ejs', {
                _csrf: req.csrfToken(),
                post: true,
                success: true,
                data: result,
            });
        });
    },

    allApplicants: function (req, res) {

        Applications.find({paymentStatus: {$ne: "TEST"}}, function (err, result) {

            if (err) {
                return res.render('admin/view-all-applicants.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    data:[],
                    // msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                });
            }
            res.render('admin/view-all-applicants.ejs', {
                _csrf: req.csrfToken(),
                post: true,
                success: true,
                data: result,
            });
        });
    },

    paidApplicantsByAdvRefNo: function (req, res) {

        let advRefNo = req.query.advRefNo || "";

        Applications.find({paymentStatus:'SUCCESS', advRefNo}, function (err, result) {

            if (err) {
                return res.render('admin/view-advPaid-applicants.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    data: [],
                    moment:moment,
                    advRefNo,
                    // msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                });
            }
            res.render('admin/view-advPaid-applicants.ejs', {
                _csrf: req.csrfToken(),
                post: true,
                success: true,
                data: result,
                moment:moment,
                advRefNo
            });
        });
    },

    elligbleApplicantsByAdvRefNo: function (req, res) {

        let advRefNo = req.query.advRefNo || "";
        let elligibilityStatus = req.query.elligble || "";

        Applications.find({elligibilityStatus, advRefNo}, function (err, result) {

            if (err) {
                return res.render('admin/view-advelligble-applicants.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    data:[],
                    advRefNo,
                    elligibilityStatus,
                    // msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                });
            }
            res.render('admin/view-advelligble-applicants.ejs', {
                _csrf: req.csrfToken(),
                post: true,
                success: true,
                data: result,
                advRefNo,
                elligibilityStatus,
            });
        });
    },

    downloadAttendenceSheet: function (req, res) {

        let advRefNo = req.query.advRefNo || "";
        let post = req.query.post || "";
        let department = req.query.department || ""; 


        Applications.find({post, department, advRefNo, elligibilityStatus:{$in:['ELIGIBLE', 'PROVISINALLY_ELIGIBLE']}}, function (err, result) {

            if (err) {
                return res.render('admin/download-attendance-list.ejs', {
                    _csrf: req.csrfToken(),
                    moment,
                    post: true,
                    success: false,
                    data:[],
                    advRefNo,
                    applicantPost: post,
                    department,
                    // msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                });
            }
            res.render('admin/download-attendance-list.ejs', {
                _csrf: req.csrfToken(),
                moment,
                post: true,
                success: true,
                data: result,
                advRefNo,
                applicantPost: post,
                department,
            });
        });
    },

    viewApplicantsForm: function (req, res) {

        let applicationId = req.query.application_id;

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/applicant/application/fetch/' + applicationId,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {

                if(data[0].body.advId == config.form3_id) {
                    res.render('admin/print-application-3.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else if (data[0].body.advId == config.form4_id) {
                    res.render('admin/print-application-4.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else if (data[0].body.advId == config.form5_id) {
                    res.render('admin/print-application-5.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else {
                    if(data[0].body.advId == config.form2_id) {
                        res.render('admin/print-application-2.ejs', {
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        })
                    } else {
                        res.render('admin/print-application.ejs', {
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        })
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                res.render('print-application.ejs', {
                    post: true,
                    success: false,
                    applicationId: data[0].body._id,
                    registrationNumber: '',
                    orderId: '',
                    keyId: '',
                    amount: -1,
                    msg: 'Failed! Cannot retrive form at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    viewApplicantsAdmitCard: function (req, res) {

        let applicationId = req.query.application_id;

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/applicant/application/fetch/' + applicationId,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {

                if(data[0].body.advId == config.form2_id) {
                    res.render('admin/admitcard.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else if(data[0].body.advId == config.form3_id){
                    res.render('admin/admitcard_tech.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                }
                else {
                    res.render('admin/admitcard.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                }
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/admitcard.ejs', {
                    post: true,
                    success: false,
                    applicationId: data[0].body._id,
                    registrationNumber: '',
                    orderId: '',
                    keyId: '',
                    amount: -1,
                    msg: 'Failed! Cannot retrive form at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    downloadApplicantsDocs: function (req, res) {

        let applicationId = req.query.application_id;

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/applicant/application/fetch/' + applicationId,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then(async (data) => {

                const zip = new JSZip();
                const applicationsUploadDir = '../../../../public/uploads/applications';
                const archiveDir = '../../../../public/uploads/archives';
                const ejsFileDir = '../../../views/admin';
                const fullUrlPath = req.protocol + '://' + req.get('host') + '/static/';

                if(data[0].body.advId == config.form2_id) {
                    try {

                        if(data[0].body.photo?.length) {
                            let fileName = data[0].body.photo;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`photo${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.signFile?.length) {
                            let fileName = data[0].body.signFile;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`signature${path.extname(fileName)}`, fileData);
                        }
                        
                        if(data[0].body.certBirth?.length) {
                            let fileName = data[0].body.certBirth;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`birth-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.cert10?.length) {
                            let fileName = data[0].body.cert10;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`matriculation-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.cert12?.length) {
                            let fileName = data[0].body.cert12;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`intermediate-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certGrad?.length) {
                            let fileName = data[0].body.certGrad;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`mbbs-msc-bds-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certPg?.length) {
                            let fileName = data[0].body.certPg;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`md-ms-dnb-phd-mds-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certDM?.length) {
                            let fileName = data[0].body.certDM;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`dm-mch-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certExp?.length) {
                            let fileName = data[0].body.certExp;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`experience-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certCommunity?.length) {
                            let fileName = data[0].body.certCommunity;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`community-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certReg?.length) {
                            let fileName = data[0].body.certReg;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`registration-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certDisab?.length) {
                            let fileName = data[0].body.certDisab;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`disability-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certNOC?.length) {
                            let fileName = data[0].body.certNOC;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`noc-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certRetired?.length) {
                            let fileName = data[0].body.certRetired;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`retirement-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther1?.length) {
                            let fileName = data[0].body.certOther1;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-1-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther2?.length) {
                            let fileName = data[0].body.certOther2;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-2-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther3?.length) {
                            let fileName = data[0].body.certOther3;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-3-certificate${path.extname(fileName)}`, fileData);
                        }

                        const ejsFilePath = path.join(__dirname, ejsFileDir, 'print-application-2.ejs');
                        let renderData = {
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        }
                        ejs.renderFile(ejsFilePath, renderData, async function(err, pageHtml){
                            pageHtml = pageHtml.replace(/\/static\//g, fullUrlPath);
                            const browser = await puppeteer.launch({ headless: true });
                            const page = await browser.newPage();
                            await page.setContent(pageHtml, {waitUntil: 'load'});
                            const pdf = await page.pdf({ format: 'A4', printBackground: true });
                            // await browser.close();
                            zip.file("application-form.pdf", pdf);

                            let downloadName = path.join(__dirname, archiveDir, `${data[0].body.registrationNumber}.zip`);
                            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                            .pipe(fs.createWriteStream(downloadName))
                            .on('finish', function () {
                                return res.download(downloadName);
                            });
                        });
                    
                    } catch (err) {
                        console.error(err)
                    }
                    // res.render('admin/print-application-2.ejs', {
                    //     success: true,
                    //     data: data[0].body,
                    //     moment: moment,
                    // })
                } else if (data[0].body.advId == config.form3_id) {
                    try {

                        if(data[0].body.photo?.length) {
                            let fileName = data[0].body.photo;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`photo${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.signFile?.length) {
                            let fileName = data[0].body.signFile;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`signature${path.extname(fileName)}`, fileData);
                        }
                        
                        if(data[0].body.certBirth?.length) {
                            let fileName = data[0].body.certBirth;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`birth-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.cert10?.length) {
                            let fileName = data[0].body.cert10;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`matriculation-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.cert12?.length) {
                            let fileName = data[0].body.cert12;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`intermediate-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certGrad?.length) {
                            let fileName = data[0].body.certGrad;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`mbbs-msc-bds-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certPg?.length) {
                            let fileName = data[0].body.certPg;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`md-ms-dnb-phd-mds-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certDM?.length) {
                            let fileName = data[0].body.certDM;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`dm-mch-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certExp?.length) {
                            let fileName = data[0].body.certExp;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`experience-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certCommunity?.length) {
                            let fileName = data[0].body.certCommunity;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`community-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certReg?.length) {
                            let fileName = data[0].body.certReg;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`registration-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certDisab?.length) {
                            let fileName = data[0].body.certDisab;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`disability-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certNOC?.length) {
                            let fileName = data[0].body.certNOC;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`noc-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certRetired?.length) {
                            let fileName = data[0].body.certRetired;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`retirement-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther1?.length) {
                            let fileName = data[0].body.certOther1;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-1-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther2?.length) {
                            let fileName = data[0].body.certOther2;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-2-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther3?.length) {
                            let fileName = data[0].body.certOther3;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-3-certificate${path.extname(fileName)}`, fileData);
                        }

                        const ejsFilePath = path.join(__dirname, ejsFileDir, 'print-application-3.ejs');
                        let renderData = {
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        }
                        ejs.renderFile(ejsFilePath, renderData, async function(err, pageHtml){
                            pageHtml = pageHtml.replace(/\/static\//g, fullUrlPath);
                            const browser = await puppeteer.launch({ headless: true });
                            const page = await browser.newPage();
                            await page.setContent(pageHtml, {waitUntil: 'load'});
                            const pdf = await page.pdf({ format: 'A4', printBackground: true });
                            // await browser.close();
                            zip.file("application-form.pdf", pdf);

                            let downloadName = path.join(__dirname, archiveDir, `${data[0].body.registrationNumber}.zip`);
                            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                            .pipe(fs.createWriteStream(downloadName))
                            .on('finish', function () {
                                return res.download(downloadName);
                            });
                        });
                    
                    } catch (err) {
                        console.error(err)
                    }
                    
                } else if (data[0].body.advId == config.form4_id) {
                    try {

                        if(data[0].body.photo?.length) {
                            let fileName = data[0].body.photo;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`photo${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.signFile?.length) {
                            let fileName = data[0].body.signFile;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`signature${path.extname(fileName)}`, fileData);
                        }
                        
                        if(data[0].body.certBirth?.length) {
                            let fileName = data[0].body.certBirth;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`birth-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.cert10?.length) {
                            let fileName = data[0].body.cert10;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`matriculation-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.cert12?.length) {
                            let fileName = data[0].body.cert12;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`intermediate-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certGrad?.length) {
                            let fileName = data[0].body.certGrad;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`graduation-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certPg?.length) {
                            let fileName = data[0].body.certPg;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`post-graduation-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certDM?.length) {
                            let fileName = data[0].body.certDM;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`diploma-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certExp?.length) {
                            let fileName = data[0].body.certExp;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`experience-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certCommunity?.length) {
                            let fileName = data[0].body.certCommunity;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`community-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certReg?.length) {
                            let fileName = data[0].body.certReg;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`registration-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certDisab?.length) {
                            let fileName = data[0].body.certDisab;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`disability-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certNOC?.length) {
                            let fileName = data[0].body.certNOC;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`noc-certificate${path.extname(fileName)}`, fileData);
                        }
                        
                        if(data[0].body.certOther1?.length) {
                            let fileName = data[0].body.certOther1;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-1-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther2?.length) {
                            let fileName = data[0].body.certOther2;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-2-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther3?.length) {
                            let fileName = data[0].body.certOther3;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-3-certificate${path.extname(fileName)}`, fileData);
                        }

                        const ejsFilePath = path.join(__dirname, ejsFileDir, 'print-application-4.ejs');
                        let renderData = {
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        }
                        ejs.renderFile(ejsFilePath, renderData, async function(err, pageHtml){
                            pageHtml = pageHtml.replace(/\/static\//g, fullUrlPath);
                            const browser = await puppeteer.launch({ headless: true });
                            const page = await browser.newPage();
                            await page.setContent(pageHtml, {waitUntil: 'load'});
                            const pdf = await page.pdf({ format: 'A4', printBackground: true });
                            // await browser.close();
                            zip.file("application-form.pdf", pdf);

                            let downloadName = path.join(__dirname, archiveDir, `${data[0].body.registrationNumber}.zip`);
                            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                            .pipe(fs.createWriteStream(downloadName))
                            .on('finish', function () {
                                return res.download(downloadName);
                            });
                        });
                    
                    } catch (err) {
                        console.error(err)
                    }
                } else {
                    try {

                        if(data[0].body.photo?.length) {
                            let fileName = data[0].body.photo;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`photo${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.signFile?.length) {
                            let fileName = data[0].body.signFile;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`signature${path.extname(fileName)}`, fileData);
                        }
                        
                        if(data[0].body.certBirth?.length) {
                            let fileName = data[0].body.certBirth;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`birth-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.cert10?.length) {
                            let fileName = data[0].body.cert10;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`matriculation-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.cert12?.length) {
                            let fileName = data[0].body.cert12;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`intermediate-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certGrad?.length) {
                            let fileName = data[0].body.certGrad;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`mbbs-msc-bds-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certPg?.length) {
                            let fileName = data[0].body.certPg;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`md-ms-dnb-phd-mds-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certDM?.length) {
                            let fileName = data[0].body.certDM;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`dm-mch-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certExp?.length) {
                            let fileName = data[0].body.certExp;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`experience-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certCommunity?.length) {
                            let fileName = data[0].body.certCommunity;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`community-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certReg?.length) {
                            let fileName = data[0].body.certReg;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`registration-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certDisab?.length) {
                            let fileName = data[0].body.certDisab;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`disability-certificate${path.extname(fileName)}`, fileData);
                        }
                        if(data[0].body.certOther?.length) {
                            let fileName = data[0].body.certOther;
                            let filePath = path.join(__dirname, applicationsUploadDir, fileName);
                            let fileData = fs.readFileSync(filePath);
                            zip.file(`other-certificate${path.extname(fileName)}`, fileData);
                        }

                        const ejsFilePath = path.join(__dirname, ejsFileDir, 'print-application.ejs');
                        let renderData = {
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        }
                        ejs.renderFile(ejsFilePath, renderData, async function(err, pageHtml){
                            pageHtml = pageHtml.replace(/\/static\//g, fullUrlPath);
                            const browser = await puppeteer.launch({ headless: true });
                            const page = await browser.newPage();
                            await page.setContent(pageHtml, {waitUntil: 'load'});
                            const pdf = await page.pdf({ format: 'A4', printBackground: true });
                            // await browser.close();
                            zip.file("application-form.pdf", pdf);

                            let downloadName = path.join(__dirname, archiveDir, `${data[0].body.registrationNumber}.zip`);
                            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                            .pipe(fs.createWriteStream(downloadName))
                            .on('finish', function () {
                                return res.download(downloadName);
                            });
                        });
                    
                    } catch (err) {
                        console.error(err)
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                res.json({
                    post: true,
                    success: false,
                    msg: 'Internal Server Error'
                });
            });
    },

    setElligibilityStatus: function (req, res) {

        Applications.updateOne({_id:req.body.id}, {elligibilityStatus: req.body.value}, function (err, result) {

            if (err) {
                return res.json({
                    post: true,
                    success: false,
                    msg: 'Error in setting elligibility status.'
                });
            }
            res.json({
                post: true,
                success: true,
                msg: 'Elligibility status set succesfully.'
            });
        });
    },

    generateRollNumbers: function (req, res) {

        if(!req.body || !req.body.advRefNo || !req.body.advRefNo.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! Invalid advertisement reference number.'
            });
        }

        if(!req.body || !req.body.prefix || !req.body.prefix.length || req.body.prefix.length > 10){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! Invalid roll number prefix.'
            });
        }

        Applications.find({advRefNo:req.body.advRefNo, department:"Pathology", post:"Senior Resident", elligibilityStatus: {$in: ['ELIGIBLE', 'PROVISINALLY_ELIGIBLE']}}, function (err, result) {
            
            if (err) {
                return res.json({
                    post: true,
                    success: false,
                    msg: 'Error in setting generating roll numbers.'
                });
            }

            if(!result || !result.length){
                return res.json({
                    post: true,
                    success: false,
                    msg: 'ERROR! No eligible applicants found to generate roll number.'
                });
            }

            for(let i = 0; i < result.length; i++) {
                let paddedCount = (i+1).toString().padStart(4, '0')
                let rollNumber = `${req.body.prefix}${paddedCount}`;
                Applications.updateOne({_id:result[i]._id}, {rollNumber}, function (err, updateRes) {
                    if(err){
                        console.log(error);
                    } else {
                        console.log(`Roll ${rollNumber} number set for id ${result[i]._id}`)
                    }
                })
            }

            res.json({
                post: true,
                success: true,
                msg: 'SUCCESS! Roll numbers generated succesfully.'
            });
        });
    },

    generateAdmitCards: function (req, res) {

        console.log(req.body);

        if(!req.body || !req.body.examDateTime || !req.body.examDateTime.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! Invalid exam date / time.'
            });
        }

        if(!req.body || !req.body.examAddress || !req.body.examAddress.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! Invalid exam address.'
            });
        }

        if(!req.body || !req.body.selectedApplicantsId || !req.body.selectedApplicantsId.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! No applicants selected.'
            });
        }
        
        Applications.updateMany(
            {_id:{$in:req.body.selectedApplicantsId}},
            { 
                admitCardGenerated: true,
                examDateTime: req.body.examDateTime,
                examAddress: req.body.examAddress,
                examNotifications: req.body.examNotifications,
                examStartDateTime: req.body.examStartDateTime,
                examEndDateTime: req.body.examEndDateTime,
            },
            function (err, result) {
                if(err){
                    return res.json({
                        post: true,
                        success: false,
                        msg: 'ERROR! Internal Server Error.'
                    });
                }
                res.json({
                    post: true,
                    success: true,
                    msg: 'SUCCESS! Admit cards generated succesfully.'
                });
        })
    },

    generateInterviewLetters: function (req, res) {

        if(!req.body || !req.body.interviewDateTime || !req.body.interviewDateTime.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! Invalid interview date / time.'
            });
        }

        if(!req.body || !req.body.interviewAddress || !req.body.interviewAddress.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! Invalid interview address.'
            });
        }

        if(!req.body || !req.body.selectedApplicantsId || !req.body.selectedApplicantsId.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! No applicants selected.'
            });
        }
        
        Applications.updateMany(
            {_id:{$in:req.body.selectedApplicantsId}},
            { 
                interviewLetterGenerated: true,
                interviewDateTime: req.body.interviewDateTime,
                interviewAddress: req.body.interviewAddress,
                interviewNotifications: req.body.interviewNotifications,
            },
            function (err, result) {
                if(err){
                    return res.json({
                        post: true,
                        success: false,
                        msg: 'ERROR! Internal Server Error.'
                    });
                }
                res.json({
                    post: true,
                    success: true,
                    msg: 'SUCCESS! Interview letters generated succesfully.'
                });
        })
    },

    sendMails: function (req, res) {

        console.log(req.body);

        if(!req.body || !req.body.emailSubject || !req.body.emailSubject.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! Invalid mail subject.'
            });
        }

        if(!req.body || !req.body.emailBody || !req.body.emailBody.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! Invalid mail body.'
            });
        }

        if(!req.body || !req.body.selectedApplicantsId || !req.body.selectedApplicantsId.length){
            return res.json({
                post: true,
                success: false,
                msg: 'ERROR! No applicants selected.'
            });
        }
        
        Applications.find({_id:{$in:req.body.selectedApplicantsId}}, function (err, result) {
            
            if (err) {
                return res.json({
                    post: true,
                    success: false,
                    msg: 'Error in sending mails.'
                });
            }

            if(!result || !result.length){
                return res.json({
                    post: true,
                    success: false,
                    msg: 'ERROR! No applicants found to send email.'
                });
            }

            for(let i = 0; i < result.length; i++) {

                let mailData = {
                    applicantName: result[i].applicantName,
                    emailBody: req.body.emailBody
                }

                let mailParams = {
                    to: result[i].applicantEmail,
                    subject: req.body.emailSubject,
                    html: mailFormats.sendApplicantsEmail(mailData)
                };


    
                mail.send(mailParams, function (error, info) {
                    if (error) {
                        console.log('Error in sending mail');
                        console.log(error);
                    } else {
                        console.log('Applicants email sent: ' + info.response);
                    }
                });
            }

            res.json({
                post: true,
                success: true,
                msg: 'SUCCESS! Mails sent succesfully.'
            });
        });
    },

    viewAdvertisementApplicants: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/advertisement/fetch/all',
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('admin/view-advertisement.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                    });
                }
                res.render('admin/view-advertisement-applicants.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    adv: data[0].body
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('admin/view-advertisement-applicants.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },
    
};

module.exports = views;
