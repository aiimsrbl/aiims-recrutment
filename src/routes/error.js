#!/usr/bin/env node

'use strict';

const env = process.env.NODE_ENV
    ? process.env.NODE_ENV.toLowerCase()
    : 'development';

/**
 *
 * If we need to pass on additional information about error, as in bulk APIs, set
 * the data property of the Error object. The data property can be anything, like
 * an array to indicate which particular items in a bulk API had errors.
 *
 *
 *
 **/
module.exports = function (err, req, res, next) {

    var code = err.status || 500;
    var response = {
        error: err.message || err,
        stack: err.stack ? err.stack.split('\n') : ''
    };

    if (err.data) {
        response.data = err.data;
    }
    if (err.url) {
        response.url = err.url;
    }

    if (code >= 500) {
        console.log(err.stack);
    }

    if (env.toLowerCase() == 'production') {
        if (code == 500) {
            response.error = 'An unexpected error has occured';
        }
        response.stack = undefined;
    }
    res.status(code).json(response);
};
