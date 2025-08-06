'use strict';

const path = require('path');

const jobApi = require('../../api/job');
const ec = require('../../lib/errorConsts');
const { advSchema } = require('../../lib/joiSchemas');

let job = {
    create: function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        // var joiRes = advSchema.validate(req.body, {
        //     abortEarly: false,
        //     stripUnknown: true
        // })

        // if (joiRes.error) {
        //     return next(joiRes.error);
        // }
        var params = {
            data: req.body,
            user: req.user
        }

        jobApi.create(params, function (err) {
            if (err) {
                return next(err);
            }
            console.log('====================')
            res.json({
                success: true,
                msg: 'Job created successfully.'
            });
        });
    },

    fetchAll: function (req, res, next) {

        jobApi.fetchAll(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    fetchActive: function (req, res, next) {

        jobApi.fetchActive(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

};

module.exports = job;
