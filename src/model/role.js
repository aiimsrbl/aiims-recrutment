'use strict';

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    user_type: {
        type: String,
        required: true,
        unique:true
    },
    menu_items: {
        type: [{

            menu_name: {
                type: String,
                required: true
            },
            path: {
                type: String,
                required: true
            },
            api_path: {
                type: String,
                default: ""
            },
            allowed: {
                type: Boolean,
                default: true
            },
            child: {
                type: [new mongoose.Schema({
                    menu_name: {
                        type: String,
                        required: true
                    },
                    path: {
                        type: String,
                        required: true
                    },
                    api_path: {
                        type: String,
                        default: ""
                    },
                    allowed: {
                        type: Boolean,
                        default: true
                    }
                }, { _id: false })], default: []
            }


        }],
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model('role', roleSchema);
