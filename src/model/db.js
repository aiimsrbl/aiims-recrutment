'use strict';

const mongoose = require('mongoose');
const config = require('../config/config.js');

let dburl;

// if (
//     config.mongodb.username &&
//     config.mongodb.username.length &&
//     config.mongodb.password &&
//     config.mongodb.password.length
// ) {
//     dburl =
//         'mongodb://' +
//         encodeURIComponent(config.mongodb.username) +
//         ':' +
//         encodeURIComponent(config.mongodb.password) +
//         '@' +
//         config.mongodb.host +
//         '/' +
//         config.mongodb.app_db;
// 	console.log(`Mongodb stated (Production): ${dburl}`)
// } else {
dburl =
    'mongodb://' +
    config.mongodb.host +
    ':' +
    config.mongodb.port +
    '/' +
    config.mongodb.app_db +
    '?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=' +
    config.mongodb.auth_db;
console.log(`Mongodb stated (Development): ${dburl}`)

// }

mongoose
    .connect(dburl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .catch((err) => {
        console.log('MongoDb connection error: ' + err);
        process.exit(1);
    });

mongoose.Promise = require('bluebird');

mongoose.connection.on('connected', function () {
    console.log('MongoDb connected.');
});

mongoose.connection.on('error', function (err) {
    console.log('MongoDb connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('MongoDb disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
function gracefulShutdown(msg, callback) {
    mongoose.connection.close(function () {
        console.log('MongoDb disconnected through ' + msg);
        callback();
    });
}

// For nodemon restarts
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// For app termination
process.on('SIGINT', function () {
    gracefulShutdown('App termination (SIGINT)', function () {
        process.exit(0);
    });
});

// For Heroku app termination
process.on('SIGTERM', function () {
    gracefulShutdown('App termination (SIGTERM)', function () {
        process.exit(0);
    });
});
