'use strict';

const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const applicationSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'user'
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'user'
    }
}, { strict: false });

applicationSchema.pre('save', function (next) {
    // if (!this.isModified('registrationNumber')) {
    //     return next();
    // }
    let appThis = this;
    mongoose.models['application'].count(function (err, count) {
        if (err) {
          console.log(err)
        } else {
          appThis.registrationNumber = `AIIMSRB${moment().format('YYYY')}${String(count+1).padStart(8, '0')}`
          next();
        }
        
      });
});

module.exports = mongoose.model('application', applicationSchema);
