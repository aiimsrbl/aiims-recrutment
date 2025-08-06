'use strict';

const jobTypeApi = require('../../api/job-type');
const ec = require('../../lib/errorConsts');
const { jobTypeSchema } = require('../../lib/joiSchemas');

let jobType = {

    create: function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        var joiRes = jobTypeSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        })

        if (joiRes.error) {
            return next(joiRes.error);
        }
        var params = {
            data: joiRes.value,
            user: req.user
        }

        jobTypeApi.create(params, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Job Type created successfully.'
            });
        });
    },

    fetchAll: function (req, res, next) {

        jobTypeApi.fetchAll(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    fetchActive: function (req, res, next) {

        jobTypeApi.fetchActive(function (err, data) {
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

        jobTypeApi.delete(req.body.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }

};

module.exports = jobType;
