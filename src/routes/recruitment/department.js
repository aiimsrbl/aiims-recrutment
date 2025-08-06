'use strict';

const departmentApi = require('../../api/department');
const ec = require('../../lib/errorConsts');
const { departmentSchema } = require('../../lib/joiSchemas');

let department = {

    create: function (req, res, next) {
        if (!req.body) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No data provided.'
                })
            );
        }

        var joiRes = departmentSchema.validate(req.body, {
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

        departmentApi.create(params, function (err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                msg: 'Department created successfully.'
            });
        });
    },

    fetchAll: function (req, res, next) {

        departmentApi.fetchAll(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },

    fetchActive: function (req, res, next) {

        departmentApi.fetchActive(function (err, data) {
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

        departmentApi.delete(req.body.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }

};

module.exports = department;
