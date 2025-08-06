'use strict';
const path = require('path');
const fs = require('fs');

const ec = require('../lib/errorConsts');
const Application = require('../model/application');
const ObjectId = require('mongoose').Types.ObjectId;
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

let application = {
    create: async function (params, cb) {
        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no qualification data'
                })
            );
        }

        var createData = {...params.data};

        // console.log(params.files);

        // params.files.files.each(function(file){
        //     console.log(file.data.name);
        // })

        for(let key in params.files){
            let filename = uuidv4() + path.extname(params.files[key]['name']);
            let uploadPath = path.join(__dirname, '../../public/uploads/applications', filename);
            fs.writeFile(uploadPath, params.files[key]['data'], function(err){
                console.log(err);
            });
            createData[key] = filename;
        }

        createData.user = params.user.id;
        let applicationfee = -1;
        
// TODO add adv id condition for form 3
if(createData.advId == config.form3_id) {
    if(createData.pwbd == 'yes' || createData.recruitMode != 'Direct' || createData.isRetired == 'Yes'){
        applicationfee = 0;
    } else {
        if(createData.category == 'UR' || createData.category == 'OBC' || createData.category == 'EWS'){
            applicationfee = 2000;
        } else if(createData.category == 'SC' || createData.category == 'ST'){
            applicationfee = 1000;
        }
    }
} else if (createData.advId == config.form4_id) {
    if(createData.pwbd == 'yes'){
        applicationfee = 0;
    } else {
        if(createData.category == 'UR' || createData.category == 'OBC' || createData.category == 'EWS'){
            applicationfee = 1000;
        } else if(createData.category == 'SC' || createData.category == 'ST'){
            applicationfee = 500;
        }
    }
} else{
        // TODO add adv id condition for form 2
        if(createData.advId == config.form2_id) {
            if(createData.pwbd == 'yes' || createData.recruitMode != 'Direct' || createData.isRetired == 'Yes'){
                applicationfee = 0;
            } else {
                if(createData.category == 'UR' || createData.category == 'OBC' || createData.category == 'EWS'){
                    applicationfee = 1500;
                } else if(createData.category == 'SC' || createData.category == 'ST'){
                    applicationfee = 800;
                }
            }
        } else {
            if(createData.pwbd == 'yes'){
                applicationfee = 0;
            } else {
                if(createData.category == 'UR' || createData.category == 'OBC' || createData.category == 'EWS'){
                    applicationfee = 1000;
                } else if(createData.category == 'SC' || createData.category == 'ST'){
                    applicationfee = 800;
                }
            }
        }
    }
        createData.applicationfee = applicationfee;
        createData.paymentStatus = 'PENDING';

        Application.create(createData, function (err, result) {

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

        Application.findById(id, function (err, result) {

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

    update: async function (params, cb) {

        if(!ObjectId.isValid(params.application_id)){
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'Invalid Id'
                })
            );
        }

        let updateData = {
            paymentStatus: 'SUCCESS',
            razorpay_order_id: params.razorpay_order_id,
            razorpay_payment_id: params.razorpay_payment_id,
            razorpay_signature: params.razorpay_signature,
        }

        Application.updateOne({_id: params.application_id}, updateData, function (err, result) {

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

    edit: async function (params, cb) {

        if (!ObjectId.isValid(params.application_id)) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'Invalid Id'
                })
            );
        }

        if (!params) {
            return cb(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'no qualification data'
                })
            );
        }

        var createData = { ...params.data };

        // console.log(params.files);

        // params.files.files.each(function(file){
        //     console.log(file.data.name);
        // })

        for (let key in params.files) {
            let filename = uuidv4() + path.extname(params.files[key]['name']);
            let uploadPath = path.join(__dirname, '../../public/uploads/applications', filename);
            fs.writeFile(uploadPath, params.files[key]['data'], function (err) {
                console.log(err);
            });
            createData[key] = filename;
        }

        createData.user = params.user.id;
        let applicationfee = -1;

         // TODO add adv id condition for form 3
        if(createData.advId == config.form3_id) {
            if(createData.pwbd == 'yes' || createData.recruitMode != 'Direct' || createData.isRetired == 'Yes'){
                applicationfee = 0;
            } else {
                if(createData.category == 'UR' || createData.category == 'OBC' || createData.category == 'EWS'){
                    applicationfee = 2000
                } else if(createData.category == 'SC' || createData.category == 'ST'){
                    applicationfee = 1000;
                }
            }
        } else {
        // TODO add adv id condition for form 2
        if (createData.advId == config.form2_id) {
            if (createData.pwbd == 'yes' || createData.recruitMode != 'Direct' || createData.isRetired == 'Yes') {
                applicationfee = 0;
            } else {
                if (createData.category == 'UR' || createData.category == 'OBC' || createData.category == 'EWS') {
                    applicationfee = 1500;
                } else if (createData.category == 'SC' || createData.category == 'ST') {
                    applicationfee = 800;
                }
            }
        } else {
            if (createData.pwbd == 'yes') {
                applicationfee = 0;
            } else {
                if (createData.category == 'UR' || createData.category == 'OBC' || createData.category == 'EWS') {
                    applicationfee = 1000;
                } else if (createData.category == 'SC' || createData.category == 'ST') {
                    applicationfee = 800;
                }
            }
        }
    }
        createData.applicationfee = applicationfee;

        Application.updateOne({_id: params.application_id}, createData, function (err, result) {

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

        Application.find({status:'Active'}, function (err, result) {

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

        Application.deleteOne({_id: id}, function (err, result) {

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

module.exports = application;
