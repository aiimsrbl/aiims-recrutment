'use strict';

const ec = require('../lib/errorConsts');
const logs = require('../model/user-logs');
const ObjectId = require('mongoose').Types.ObjectId;
let logApi = {
    

    fetchAll: async function (cb) {

        logs.find({}).sort({ created_at: -1 }).exec(function (err, result) {

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

        logs.deleteOne({ _id: id }, function (err, result) {

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

module.exports = logApi;
