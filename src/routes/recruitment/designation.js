'use strict';

const designationApi = require('../../api/designation');
const ec = require('../../lib/errorConsts');
const { designationSchema } = require('../../lib/joiSchemas');

let designation = {

    create: function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        var joiRes = designationSchema.validate(req.body, {
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

        designationApi.create(params, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Designation created successfully.'
            });
        });
    },

    fetchAll: function (req, res, next) {

        designationApi.fetchAll(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    fetchActive: function (req, res, next) {

        designationApi.fetchActive(function (err, data) {
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

        designationApi.delete(req.body.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }

};

module.exports = designation;
