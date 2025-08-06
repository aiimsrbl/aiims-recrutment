'use strict';

const ec = require('../lib/errorConsts');
const role = require('../model/role');
const ObjectId = require('mongoose').Types.ObjectId;
let roleApi = {
    create: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no regietration data'
                })
            );
        }

        role.create(params.data, function (err, result) {

            if (err) {
                console.log(err);
                return cb(
                    ec.appError({
                        status: ec.DB_ERROR,
                        message: 'DB Error'
                    })
                );
            }

            return cb(err, result);
        });
    },

    fetchAll: async function (cb) {

        role.find({}, function (err, result) {

            if (err) {
                console.log(err);
                return cb(
                    ec.appError({
                        status: ec.DB_ERROR,
                        message: 'DB Error'
                    })
                );
            }

            return cb(err, result);
        });
    },

    fetchActive: async function (cb) {

        role.find({ status: 'Active' }, function (err, result) {

            if (err) {
                console.log(err);
                return cb(
                    ec.appError({
                        status: ec.DB_ERROR,
                        message: 'DB Error'
                    })
                );
            }

            return cb(err, result);
        });
    },
    delete: async function (id, cb) {

        if (!ObjectId.isValid(id)) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'Invalid Id'
                })
            );
        }

        role.deleteOne({ _id: id }, function (err, result) {

            if (err) {
                console.log(err);
                return cb(
                    ec.appError({
                        status: ec.DB_ERROR,
                        message: 'DB Error'
                    })
                );
            }

            return cb(err, result);
        });
    },
    getRolebyId: async function (id, cb) {

        if (!ObjectId.isValid(id)) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'Invalid Id'
                })
            );
        }

        role.findOne({ _id: id }, function (err, result) {

            if (err) {
                console.log(err);
                return cb(
                    ec.appError({
                        status: ec.DB_ERROR,
                        message: 'DB Error'
                    })
                );
            }

            return cb(err, result);
        });
    }
};

module.exports = roleApi;
