'use strict';

module.exports = {
    user: {
        email: 'required|email|minLength:2',
        name: 'required|string',
        role: 'required|string',
        phone: 'required|string',
        password: 'required|same:confirm_password'
    },

    advertisement: {
        refrenceNumber: 'required|string|minLength:3|maxLength:3',
        title: 'required|string|minLength:3|maxLength:100',
        publishedDate: 'required|date',
        status: 'required|string|minLength:3|maxLength:10',
        file: 'required',
        description: 'required|string|minLength:3|maxLength:5000'
    }
};
