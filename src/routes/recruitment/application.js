'use strict';

const applicationApi = require('../../api/application');
const ec = require('../../lib/errorConsts');
// const { qualificationSchema } = require('../../lib/joiSchemas');

let application = {

    create: function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }
        // console.log(req.files);

        let params = {
            data: req.body,
            files: req.files,
            user: req.user
        }


        // var joiRes = qualificationSchema.validate(req.body, {
        //     abortEarly: false,
        //     stripUnknown: true
        // })

        // if (joiRes.error) {
        //     return next(joiRes.error);
        // }
        // var params = {
        //     data: joiRes.value,
        //     user: req.user
        // }

        applicationApi.create(params, function (err, result) {
            if (err) {
                return next(err);
            }
            const applicationId = result._id;
            res.redirect(`/application-success?application_id=${applicationId}`);
        });
    },

    edit: function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }
        console.log(req.body);

        let params = {
            data: req.body,
            files: req.files,
            user: req.user,
            application_id: req.body.application_id
        }


        // var joiRes = qualificationSchema.validate(req.body, {
        //     abortEarly: false,
        //     stripUnknown: true
        // })

        // if (joiRes.error) {
        //     return next(joiRes.error);
        // }
        // var params = {
        //     data: joiRes.value,
        //     user: req.user
        // }

        applicationApi.edit(params, function (err, result) {
            if (err) {
                return next(err);
            }
            const applicationId = result._id;
            res.redirect(`/my-jobs`);
        });
    },

    fetchById: function (req, res, next) {

        if (!req.params.id) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No id provided.'
                })
            );
        }

        applicationApi.fetchById(req.params.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    update: function (req, res, next) {

        if (!req.body?.application_id) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No id provided.'
                })
            );
        }

        applicationApi.update(req.body, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    // fetchActive: function (req, res, next) {

    //     qualificationApi.fetchActive(function (err, data) {
    //         if (err) {
    //             return next(err);
    //         }
    //         res.json(data);
    //     });
    // },

    // delete: function(req, res, next) {

    //     if(!req.body.id && !req.body.id.length){
    //         return next(
    //             ec.appError({
    //                 status: ec.INVALID_PARAM,
    //                 message: 'No id provided.'
    //             })
    //         );
    //     }

    //     qualificationApi.delete(req.body.id, function (err, data) {
    //         if (err) {
    //             return next(err);
    //         }
    //         res.json(data);
    //     });
    // }

};

module.exports = application;
