'use strict';

const define = require('node-constants')(exports);

define('LOGIN_FAILURE', 901);
define('EMPTY_USER_PASS', 902);
define('UNAUTHORIZED_ACCESS', 903);
define('DB_ERROR', 904);
define('UNKNOWN_ERROR', 905);
define('INETRNAL_ERROR', 906);
define('INVALID_PARAM', 907);
define('INVALID_DATA', 908);
define('UNDEFINED_DATA', 909);
define('NOT_FOUND', 910);
define('USER_EXISTS', 911);
define('WRONG_OTP', 912);
define('INVALID_TOKEN', 913);

let appError = function (obj) {
    if (obj) {
        let err_msg = obj.message || 'Internal Error';
        let err = new Error(err_msg);
        err.status = obj.status;
        return err;
    }
};

let checkError = function (err) {
    if (err) {
        console.log('DB Error:', err);
    }
};

define('appError', appError);
define('checkError', checkError);
