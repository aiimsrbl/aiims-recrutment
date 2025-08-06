'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const usersModel = require('../../model/users');

module.exports = function () {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },

            function (req, email, password, done) {
                usersModel.find({email:email, role:req.body.role}, function (err, result) {
                    if (err) {
                        console.log(new Error('DB Error :: ' + err));
                        done(null, false, { message: 'DB Error' });
                    }

                    if (!result || !result.length) {
                        console.log('Email not found..');
                        done(null, false, { message: 'Invalid Email' });
                    } else {
                        result = result[0];

                        bcrypt.compare(
                            password,
                            result.password,
                            function (err, authorised) {
                                if (authorised) {
                                    console.log('Login Success.. ' + email);
                                    let user = {
                                        id: result._id,
                                        email: result.email,
                                        role: result.role,
                                        name: result.name,
                                        phone: result.phone
                                    };
                                    done(null, user);
                                } else {
                                    console.log('Wrong Password');
                                    done(null, false, {
                                        message: 'Invalid Email Or Password!'
                                    });
                                }
                            }
                        );
                    }
                });
            }
        )
    );
};
