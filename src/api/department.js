'use strict';

const ec = require('../lib/errorConsts');
const Department = require('../model/department');
const ObjectId = require('mongoose').Types.ObjectId;

let department = {
    create: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no department data'
                })
            );
        }

        var createData = {
            name: params.data.name,
            status: params.data.status,
            description: params.data.description,
            created_by: params.user.id
        }

        Department.create(createData, function (err, result) {

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

        Department.find({}, function (err, result) {

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

        Department.find({status:'Active'}, function (err, result) {

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

        if(!ObjectId.isValid(id)){
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'Invalid Id'
                })
            );
        }

        Department.deleteOne({_id: id}, function (err, result) {

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
};

module.exports = department;
