'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ec = require('../lib/errorConsts');
const Advertisement = require('../model/advertisement');
const ObjectId = require('mongoose').Types.ObjectId;

let advertisement = {
    create: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no regietration data'
                })
            );
        }

        let filename = uuidv4() + '.pdf';
        let uploadPath = path.join(__dirname, '../../public/uploads/advertisements', filename);

        fs.writeFile(uploadPath, params.file.data, function (err) {

            if (err) {
                console.log(err);
                return cb(ec.appError({
                    status: ec.FILE_UPLOAD_ERROR,
                    message: "Error in uploading file."
                }));
            }

            var createData = {
                refrence_number: params.data.refrenceNumber,
                title: params.data.title,
                published_date: params.data.publishedDate,
                status: params.data.status,
                description: params.data.description,
                fileName: filename,
                created_by: params.user.id
            }

            Advertisement.create(createData, function (err, result) {

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
        });
    },

    fetchAll: async function (cb) {

        Advertisement.find({}, function (err, result) {

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

        Advertisement.find({status:'Active'}, function (err, result) {

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

    fetchById: async function (id, cb) {

        if(!ObjectId.isValid(id)){
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'Invalid Id'
                })
            );
        }

        Advertisement.findById(id, function (err, result) {

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

        Advertisement.deleteOne({_id: id}, function (err, result) {

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

module.exports = advertisement;
