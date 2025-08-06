'use strict';

const nodemailer = require('nodemailer');
const nmConfig = require('../config/config').node_mailer;

module.exports = {
    send: function (params, cb) {
        let transporter = nodemailer.createTransport({
            service: nmConfig.service,
            auth: {
                user: nmConfig.auth.user,
                pass: nmConfig.auth.pass
            }
        });

        let mailOptions = {
            from: 'Recruitment App <iafmindia22@gmail.com>',
            to: params.to,
            subject: params.subject || 'NO SUBJECT',
            html: params.html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            return cb(error, info);
        });
    }
};
