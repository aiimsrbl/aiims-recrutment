'use strict';

const needle = require('needle');
const passport = require('passport');
const moment = require('moment');
const Razorpay = require('razorpay');
const axios = require('axios');
const mail = require('../../../utils/mail');
const mailFormats = require('../../../lib/mailFormats');
const config = require('../../../config/config');
const Application = require('../../../model/application');
const qs = require('querystring');
const Users = require('../../../model/users');

let instance = new Razorpay({
    key_id: config.razor_pay.key_id,
    key_secret: config.razor_pay.key_secret
})

let views = {

    home: function (req, res) {

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
                    return res.render('user/index.ejs', {
                        post: false,
                        success: false,
                        msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                    });
                }
                res.render('user/index.ejs', {
                    post: false,
                    success: true,
                    adv: data[0].body,
                    moment
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('user/index.ejs', {
                    post: true,
                    success: false,
                    msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    login: function (req, res) {
        if (req.user) {
            if (req.user.role !== "APPLICANT") {
                return res.redirect("/logout");
            }
            return res.redirect("/");
        }
        return res.render("user/login.ejs", {
            _csrf: req.csrfToken(),
            post: false,
        });
    },

    profile: function (req, res) {
        Users.findOne({ _id: req.user.id }, function (err, result) {
            if (err) {
                return res.render('user/profile.ejs', {
                    post: true,
                    success: false,
                    data: {}
                });
            }
            res.render('user/profile.ejs', {
                post: true,
                success: true,
                data: result,
            });
        });
    },

    myJobs: function (req, res) {
        Application.find({ user: req.user.id, paymentStatus: { $ne: 'TEST' } }, function (err, result) {
            if (err) {
                return res.render('user/my-jobs.ejs', {
                    post: true,
                    success: false,
                    data: []
                });
            }
            res.render('user/my-jobs.ejs', {
                post: true,
                success: true,
                data: result,
            });
        });
    },



    applicationSuccess: function (req, res) {

        // return res.redirect('/');

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

                if (!data[0].body._id || data[0].body.user !== req.user.id) {
                    return res.redirect('/logout');
                }

                if (data[0].body.error) {
                    return res.render('user/application-success.ejs', {
                        post: false,
                        success: false,
                        applicationId: data[0].body._id,
                        registrationNumber: '',
                        orderId: '',
                        keyId: '',
                        amount: -1,
                        msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. ' + data[0].body.error
                    });
                }


                if (data[0].body.applicationfee == 0) {
                    return res.render('user/application-success.ejs', {
                        applicationId: data[0].body._id,
                        registrationNumber: data[0].body.registrationNumber,
                        orderId: 'NA',
                        amount: data[0].body.applicationfee,
                        advRefNo: data[0].body.advRefNo,
                    });

                }
                let options = {
                    amount: data[0].body.applicationfee * 100,  // amount in the smallest currency unit converted to rupees
                    currency: "INR",
                    receipt: data[0].body._id
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(err);
                    }
                    res.render('user/application-success.ejs', {
                        applicationId: data[0].body._id,
                        registrationNumber: data[0].body.registrationNumber,
                        orderId: order.id,
                        keyId: config.razor_pay.key_id,
                        amount: data[0].body.applicationfee * 100,
                        applicantName: data[0].body.applicantName,
                        applicantEmail: data[0].body.applicantEmail,
                        applicantMobile: data[0].body.applicantMobile,
                        advRefNo: data[0].body.advRefNo,

                    });
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('user/application-success.ejs', {
                    post: true,
                    success: false,
                    applicationId: data[0].body._id,
                    registrationNumber: '',
                    orderId: '',
                    keyId: '',
                    amount: -1,
                    msg: 'Failed! Cannot retrive advertisement at the moment. Please try again after some time. Internal Server Error.'
                });
            });
    },

    verifyPayment: function (req, res) {
        var isVerified = false;
        if (!req.body.skipAmount) {
            let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

            let crypto = require("crypto");
            let expectedSignature = crypto.createHmac('sha256', config.razor_pay.key_secret)
                .update(body.toString())
                .digest('hex');
            // console.log("sig received " ,req.body.razorpay_signature);
            // console.log("sig generated " ,expectedSignature);

            if (expectedSignature === req.body.razorpay_signature) {
                isVerified = true;
            }
        } else {
            isVerified = true;
        }

        if (isVerified) {
            let needleOptions = {
                gzip: true,
                headers: req.headers
            };

            let updateData = {
                application_id: req.body.application_id,
                razorpay_order_id: req.body.razorpay_order_id || 'NA',
                razorpay_payment_id: req.body.razorpay_payment_id || 'NA',
                razorpay_signature: req.body.razorpay_signature || 'NA',
            }

            let requestData = [
                needle(
                    'POST',
                    req.protocol + '://' + req.get('host') + '/api/applicant/application/update',
                    updateData,
                    needleOptions
                )
            ];

            Promise.all(requestData)
                .then((data) => {
                    if (data[0].body.error) {
                        res.json({
                            success: false,
                            msg: 'Unable to update payment in DB.'
                        })
                    }

                    let params = {
                        name: req.user.name,

                        registration_number: req.body.registration_number,
                        razorpay_order_id: req.body.razorpay_order_id || 'NA',
                        razorpay_payment_id: req.body.razorpay_payment_id || 'NA',
                        razorpay_signature: req.body.razorpay_signature || 'NA',
                    }

                    let mailParams = {
                        to: req.user.email,
                        subject: 'AIIMS Recruitment Payment Details',
                        html: mailFormats.paymentSuccess(params)
                    };

                    mail.send(mailParams, function (error, info) {
                        if (error) {
                            console.log('Error in sending welcome mail');
                            console.log(error);
                        } else {
                            console.log('Payment Successful email sent: ' + info.response);
                        }
                    });


                    res.json({
                        success: true,
                        msg: 'Payment Verified successfully.'
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        msg: 'Internal Server error.'
                    })
                });
        } else {
            res.json({
                success: false,
                msg: 'Invalid payment signature.'
            })
        }
    },

    printApplicationForm: function (req, res) {

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

                if (!data[0].body._id || data[0].body.user !== req.user.id) {
                    return res.redirect('/logout');
                }
                if (data[0].body.advId == config.form3_id) {
                    res.render('user/print-application-3.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else if (data[0].body.advId == config.form4_id) {
                    res.render('user/print-application-4.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else if (data[0].body.advId == config.form5_id) {
                    res.render('user/print-application-5.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else {
                    if (data[0].body.advId == config.form2_id) {
                        res.render('user/print-application-2.ejs', {
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        })
                    } else {
                        res.render('user/print-application.ejs', {
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

    editApplicationForm: function (req, res) {

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

                if (!data[0].body._id || data[0].body.user !== req.user.id) {
                    return res.redirect('/logout');
                }
                if (data[0].body.advId == config.form3_id) {
                    res.render('user/edit-application-3.ejs', {
                        _csrf: req.csrfToken(),
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else if (data[0].body.advId == config.form4_id) {
                    res.render('user/edit-application-4.ejs', {
                        _csrf: req.csrfToken(),
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else {
                    if (data[0].body.advId == config.form2_id) {
                        res.render('user/edit-application-2.ejs', {
                            _csrf: req.csrfToken(),
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        })
                    } else if (data[0].body.advId == config.form5_id) {
                        res.render('user/edit-application-jr.ejs', {
                            _csrf: req.csrfToken(),
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        });
                    } else {
                        res.render('user/edit-application-sr.ejs', {
                            _csrf: req.csrfToken(),
                            success: true,
                            data: data[0].body,
                            moment: moment,
                        });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                res.render('edit-application-2.ejs', {
                    _csrf: req.csrfToken(),
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

    printAdmitCard: function (req, res) {

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

                if (!data[0].body._id || data[0].body.user !== req.user.id) {
                    return res.redirect('/logout');
                }
                if (data[0].body.advRefNo == 'AIIMS/RBL/Rec/Contract/Technician') {
                    res.render('user/admit-card-tech.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                } else {
                    res.render('user/admit-card-2.ejs', {
                        success: true,
                        data: data[0].body,
                        moment: moment,
                    })
                }
            })
            .catch((err) => {
                console.log(err);
                res.render('admit-card.ejs', {
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

    checkDuplicateApplication: function (req, res) {

        let query = {
            paymentStatus: 'SUCCESS',
            user: req.user.id,
            post: req.body.post,
            advRefNo: req.body.advRefNo,
            department: req.body.department
        }

        Application.find(query, function (err, result) {
            console.log(result);
            if (err) {
                res.json({
                    success: false,
                    err: 'Internal Server Error'
                });
            }
            if (result && result.length) {
                res.json({
                    success: false,
                    err: 'You had already applied for this post. If you apply again for the same advertisement with same post and department then your application can be cancelled without any notification.'
                });
            } else {
                res.json({
                    success: true,
                    err: ''
                });
            }

        });
    },

    forgotPassword: function (req, res) {
        if (req.user) {
            return res.redirect('/');
        }
        res.render('user/forgot-password.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    register: function (req, res) {
        if (req.user) {
            if (req.user.role !== 'APPLICANT') {
                return res.redirect('/logout');
            }
            return res.redirect('/');
        }
        res.render('user/register.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    registerPost: function (req, res, next) {
        let reqBody = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            custom: 'hello'
        };
        // if (reqBody.password !== reqBody.confirmPassword){
        //     return res.render('user/register.ejs', {
        //         _csrf: req.csrfToken(),
        //         post: true,
        //         success: false,
        //         msg: 'Registration Failed!. Password and Confirm Password do not match.'
        //     });
        // }
        let needleOptions = {
            gzip: true,
            headers: req.headers
        };
        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/register',
                reqBody,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('user/register.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Registration Failed! ' + data[0].body.error
                    });
                }
                res.render('user/register.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    msg: 'Registration successfull.'
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('user/register.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Registration Failed!. Internal Server Error.'
                });
            });
    },

    verifyEmail: function (req, res) {
        let reqBody = {
            token: req.query.token,
            id: req.query.id
        };
        let needleOptions = {
            gzip: true,
            headers: req.headers
        };
        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/verify-email',
                reqBody,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('user/verify-email.ejs', {
                        _csrf: req.csrfToken(),
                        msg: 'Email Verification Failed! ' + data[0].body.error
                    });
                }
                res.render('user/verify-email.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    msg: 'Email verified successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('user/verify-email.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    msg: 'Email Verification Failed!. Internal Server Error.'
                });
            });
    },

    // loginPost: async function (req, res, next) {

    //     const { email, password, 'g-recaptcha-response': captcha } = req.body;
    //     req.body.role = 'APPLICANT'
    //     if (!captcha) {
    //         return res.render('user/login.ejs', { post: true, msg: 'Please complete the CAPTCHA.' });
    //     }

    //     const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}&remoteip=${req.ip}`;

    //     try {
    //         const { data } = await axios.post(verifyUrl);

    //         if (!data.success) {
    //             return res.render('user/login.ejs', { post: true, msg: 'CAPTCHA verification failed. Try again.' });
    //         }

    //         passport.authenticate('local', function (err, user) {
    //             if (err) {
    //                 return next(err);
    //             }



    //             if (!user) {
    //                 return res.render('user/login.ejs', {
    //                     _csrf: req.csrfToken(),
    //                     post: true,
    //                     msg: 'Invalid email or password.'
    //                 });
    //             }

    //             req.logIn(user, function (err) {
    //                 if (err) {
    //                     return next(err);
    //                 }
    //                 if (req.query?.redirect_url) {
    //                     return res.redirect(req.query.redirect_url);
    //                 } else {
    //                     return res.redirect('/');
    //                 }
    //             });
    //         })(req, res, next);

    //         res.render('user/login.ejs', {
    //             _csrf: req.csrfToken(),
    //             post: false
    //         });

    //     } catch (err) {
    //         console.error(err);
    //         return res.render('user/login.ejs', { post: true, msg: 'CAPTCHA verification failed.' });
    //     }

    // },







    loginPost: async function (req, res, next) {
        const { email, password, 'g-recaptcha-response': captcha } = req.body;
        req.body.role = 'APPLICANT';

        if (!captcha) {
            return res.render('user/login.ejs', {
                _csrf: req.csrfToken(),
                post: true,
                msg: 'Please complete the CAPTCHA.',
            });
        }

        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

        try {
            const { data } = await axios.post(
                verifyUrl,
                qs.stringify({
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captcha,
                    remoteip: req.ip,
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }
            );

            if (!data.success) {
                return res.render('user/login.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    msg: 'CAPTCHA verification failed. Try again.',
                });
            }

            passport.authenticate('local', function (err, user, info) {
                if (err) return next(err);

                if (!user) {
                    return res.render('user/login.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        msg: 'Invalid email or password.',
                    });
                }

                req.logIn(user, function (err) {
                    if (err) return next(err);

                    // ✅ Always return here to stop further execution
                    return res.redirect(req.query?.redirect_url || '/');
                });
            })(req, res, next); // ✅ Call passport.authenticate with req, res, next

        } catch (err) {
            console.error('CAPTCHA verification error:', err);

            let csrfToken;
            try {
                csrfToken = req.csrfToken(); // regenerate token if necessary
            } catch (csrfErr) {
                csrfToken = ''; // fallback
            }

            return res.render('user/login.ejs', {
                _csrf: csrfToken,
                post: true,
                msg: 'An error occurred during CAPTCHA verification.',
            });
        }
    },


    // forgotPasswordPost: function (req, res) {
    //     let needleOptions = {
    //         gzip: true,
    //         headers: req.headers
    //     };
    //     let requestData = [
    //         needle(
    //             'POST',
    //             req.protocol +
    //             '://' +
    //             req.get('host') +
    //             '/api/request-password-reset',
    //             req.body,
    //             needleOptions
    //         )
    //     ];

    //     Promise.all(requestData)
    //         .then((data) => {
    //             if (data[0].body.error) {
    //                 return res.render('user/forgot-password.ejs', {
    //                     _csrf: req.csrfToken(),
    //                     post: true,
    //                     success: false,
    //                     msg: 'Password Reset Failed! ' + data[0].body.error
    //                 });
    //             }
    //             res.render('user/forgot-password.ejs', {
    //                 _csrf: req.csrfToken(),
    //                 post: true,
    //                 success: true,
    //                 msg: 'Email with password reset link sent successfully. Please check your mail.'
    //             });
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             res.render('user/forgot-password.ejs', {
    //                 _csrf: req.csrfToken(),
    //                 post: true,
    //                 success: false,
    //                 msg: 'Password Reset Failed!. Internal Server Error.'
    //             });
    //         });
    // },

    forgotPasswordPost: async (req, res) => {
        const captcha = req.body['g-recaptcha-response'];

        if (!captcha) {
            return res.render("user/forgot-password.ejs", {
                _csrf: req.csrfToken(),
                post: true,
                success: false,
                msg: "Please complete the CAPTCHA.",
            });
        }

        try {
            const { data } = await axios.post(
                'https://www.google.com/recaptcha/api/siteverify',
                qs.stringify({
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captcha,
                    remoteip: req.ip,
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }
            );

            if (!data.success) {
                return res.render("user/forgot-password.ejs", {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: "CAPTCHA verification failed. Please try again.",
                });
            }

            // CAPTCHA passed → proceed with password reset logic
            let requestData = [
                needle(
                    "POST",
                    req.protocol + "://" + req.get("host") + "/api/request-password-reset",
                    req.body,
                    needleOptions
                ),
            ];

            Promise.all(requestData)
                .then((data) => {
                    if (data[0].body.error) {
                        return res.render("user/forgot-password.ejs", {
                            _csrf: req.csrfToken(),
                            post: true,
                            success: false,
                            msg: "Password Reset Failed! " + data[0].body.error,
                        });
                    }
                    res.render("user/forgot-password.ejs", {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: true,
                        msg: "Email with password reset link sent successfully. Please check your mail.",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.render("user/forgot-password.ejs", {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: "Password Reset Failed!. Internal Server Error.",
                    });
                });

        } catch (err) {
            console.error("CAPTCHA verification failed:", err);
            return res.render("user/forgot-password.ejs", {
                _csrf: req.csrfToken(),
                post: true,
                success: false,
                msg: "An error occurred during CAPTCHA verification.",
            });
        }
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
        res.render('user/reset-password.ejs', {
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
            res.render('user/reset-password.ejs', {
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
                    return res.render('user/reset-password.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        success: false,
                        msg: 'Password Reset Failed! ' + data[0].body.error
                    });
                }
                res.render('user/reset-password.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: true,
                    msg: 'Password reset successfull. Please login.'
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('user/reset-password.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    success: false,
                    msg: 'Password reset Failed!. Internal Server Error.'
                });
            });
    },

    changePassword: function (req, res) {
        res.render('password-change.ejs', {
            _csrf: req.csrfToken(),
            post: false
        });
    },

    changePasswordPost: function (req, res) {
        let reqBody = {
            old_password: req.body.old_password,
            password: req.body.password,
            confirm_password: req.body.confirm_password
        };
        let needleOptions = {
            gzip: true,
            headers: req.headers
        };
        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/change-password',
                reqBody,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('password-change.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        msg: 'Password Change Failed! ' + data[0].body.error
                    });
                }
                res.render('password-change.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    msg: 'Password changed successfully.'
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('password-change.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    msg: 'Password Change Failed!. Internal Server Error.'
                });
            });
    },

    applicationForm: function (req, res) {
        // return res.redirect('/');
        if (req.user.role === 'MANAGEMENT') {
            return res.redirect('/management/dashboard');
        }

        // if(req.query.advertisement_id != config.form2_id){
        //     res.status(404);
        //     return res.render('commons/error-page.ejs', {
        //         statusCode: 404,
        //         error: 'Page Not Found',
        //         description: 'Oops!!!! you tried to access a page which is not available. go back to Home',
        //     });
        // }



        let needleOptions = {
            gzip: true,
            headers: req.headers
        };

        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/advertisement/fetch/' + req.query.advertisement_id,
                req.body,
                needleOptions
            ),

            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/management/department/fetch/active',
                req.body,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error || data[1].body.error) {
                    return res.render('user/application-form.ejs', {
                        _csrf: req.csrfToken(),
                        success: false,
                        adv: [],
                        dep: [],
                        msg: data[0].body.error
                    });
                }
                if (req.query.advertisement_id == config.form3_id) {
                    res.render('user/application-form-3.ejs', {
                        _csrf: req.csrfToken(),
                        success: false,
                        adv: data[0].body,
                        dep: data[1].body,
                    });
                } else if (req.query.advertisement_id == config.form4_id) {
                    res.render('user/application-form-4.ejs', {
                        _csrf: req.csrfToken(),
                        success: false,
                        adv: data[0].body,
                        dep: data[1].body,
                    });
                } else if (req.query.advertisement_id == config.form5_id) {
                    res.render('user/application-form-5.ejs', {
                        _csrf: req.csrfToken(),
                        success: false,
                        adv: data[0].body,
                        dep: data[1].body,
                    });
                } else {
                    if (req.query.advertisement_id == config.form2_id) {
                        res.render('user/application-form-2.ejs', {
                            _csrf: req.csrfToken(),
                            success: false,
                            adv: data[0].body,
                            dep: data[1].body,
                        });
                    } else {
                        res.render('user/application-form.ejs', {
                            _csrf: req.csrfToken(),
                            success: false,
                            adv: data[0].body,
                            dep: data[1].body,
                        });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                res.render('user/application-form.ejs', {
                    _csrf: req.csrfToken(),
                    success: false,
                    adv: [],
                    dep: [],
                    msg: 'Internal Server Error.'
                });
            });
    },

    applicationFormPost: function (req, res) {

        // return res.redirect('/');

        let data = { ...req.body, file: req.files, content_type: 'image/png' };

        console.log(req.files);

        let needleOptions = {
            gzip: true,
            headers: req.headers,
            multipart: true,
            json: true
        };

        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/applicant/application/create/',
                data,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('user/application-success.ejs', {
                        _csrf: req.csrfToken(),
                        success: false,
                    });
                }
                res.render('user/application-success.ejs', {
                    _csrf: req.csrfToken(),
                    success: false,
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('user/application-success.ejs', {
                    _csrf: req.csrfToken(),
                    success: false,
                });
            });
    },

    editProfile: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };
        let requestData = [
            needle(
                'GET',
                req.protocol + '://' + req.get('host') + '/api/profile',
                req.body,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('edit-profile.ejs', {
                        _csrf: req.csrfToken(),
                        post: false,
                        success: false,
                        msg: data[0].body.error
                    });
                }
                res.render('edit-profile.ejs', {
                    _csrf: req.csrfToken(),
                    post: false,
                    user: data[0].body
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('edit-profile.ejs', {
                    _csrf: req.csrfToken(),
                    success: false,
                    post: false,
                    msg: 'Internal Server Error.'
                });
            });
    },

    editProfilePost: function (req, res) {

        let needleOptions = {
            gzip: true,
            headers: req.headers
        };
        let requestData = [
            needle(
                'POST',
                req.protocol + '://' + req.get('host') + '/api/edit-profile',
                req.body,
                needleOptions
            )
        ];

        Promise.all(requestData)
            .then((data) => {
                if (data[0].body.error) {
                    return res.render('edit-profile.ejs', {
                        _csrf: req.csrfToken(),
                        post: true,
                        msg: 'Edit Profile Failed! ' + data[0].body.error
                    });
                }
                res.render('edit-profile.ejs', {
                    _csrf: req.csrfToken(),
                    post: true,
                    msg: 'Profile changed successfully! '
                });
            })
            .catch((err) => {
                console.log(err);
                res.render('edit-profile.ejs', {
                    _csrf: req.csrfToken(),
                    success: false,
                    post: true,
                    msg: 'Edit Profile Failed! Internal Server Error.'
                });
            });
    }
};

module.exports = views;
