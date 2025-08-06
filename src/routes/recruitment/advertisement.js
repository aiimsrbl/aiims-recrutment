'use strict';

const path = require('path');

const advertisementApi = require('../../api/advertisement');
const ec = require('../../lib/errorConsts');
const { advSchema } = require('../../lib/joiSchemas');

let advertisement = {
    create: function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        if (req.files?.file) {
            
            // const allowedExt = ['.docx', '.doc', '.pdf'];

            // if (allowedExt.indexOf(path.extname(req.files?.file?.name)) < 0) {
            //     return next(
            //         ec.appError({
            //             status: ec.INVALID_PARAM,
            //             message: 'Invalid File type.'
            //         })
            //     );
            // }

            if (req.files?.file?.size > 2000000) { //2MB
                return next(
                    ec.appError({
                        status: ec.INVALID_PARAM,
                        message: 'File Size must be less than 2MB.'
                    })
                );
            }
        }

        var joiRes = advSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        })

        if (joiRes.error) {
            return next(joiRes.error);
        }
        var params = {
            data: joiRes.value,
            file: req.files.file,
            user: req.user
        }

        advertisementApi.create(params, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Advertisement created successfully.'
            });
        });
    },

    fetchAll: function (req, res, next) {

        advertisementApi.fetchAll(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    fetchActive: function (req, res, next) {

        advertisementApi.fetchActive(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    fetchById: function (req, res, next) {

        if (!req.params?.id) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No id provided.'
                })
            );
        }

        advertisementApi.fetchById(req.params.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    delete: function(req, res, next) {

        if(!req.body.id && !req.body.id.length){
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No id provided.'
                })
            );
        }

        advertisementApi.delete(req.body.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }

};

module.exports = advertisement;
