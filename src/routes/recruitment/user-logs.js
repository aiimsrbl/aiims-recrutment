"use strict"
const logApi = require('../../api/user-logs');
let  logController = {

    
    fetchAll: function (req, res, next) {

        logApi.fetchAll(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }
    


}

module.exports = logController
