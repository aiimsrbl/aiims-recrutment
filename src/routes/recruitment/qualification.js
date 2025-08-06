'use strict';

const qualificationApi = require('../../api/qualification');
const ec = require('../../lib/errorConsts');
const { qualificationSchema } = require('../../lib/joiSchemas');

let qualification = {

    create: function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        var joiRes = qualificationSchema.validate(req.body, {
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

        qualificationApi.create(params, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Qualification created successfully.'
            });
        });
    },

    fetchAll: function (req, res, next) {

        qualificationApi.fetchAll(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    fetchActive: function (req, res, next) {

        qualificationApi.fetchActive(function (err, data) {
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

        qualificationApi.delete(req.body.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }

};

module.exports = qualification;
