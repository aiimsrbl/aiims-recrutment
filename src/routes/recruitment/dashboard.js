'use strict';

const dashboardApi = require('../../api/dashboard');

let dashboard = {
    home: async function (req, res) {
        res.json({
            user: req.user,
            msg: 'This is your awesome dashboard.'
        });
    },

};

module.exports = dashboard;
