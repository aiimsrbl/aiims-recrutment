const Joi = require('joi');

module.exports = {

    advSchema: Joi.object({
        refrenceNumber: Joi.string().trim().min(3).max(100).required().label('Reference Number'),
        title: Joi.string().trim().min(3).max(500).required().label('Title'),
        publishedDate: Joi.date().required().label('Published Date'),
        status: Joi.string().trim().min(3).max(100).required().label('Status').valid('Active', 'Inactive'),
        description: Joi.string().trim().min(3).max(1000).required().label('Description'),
    }),

    userSchema: Joi.object({
        email: Joi.string().trim()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in', 'org'] } })
        .required().label('Email Address'),

        name: Joi.string().trim().min(3).max(100).required().label('Full Name'),

        role: Joi.string().trim().required().valid('APPLICANT', 'MANAGEMENT', 'ADMINISTRATOR').label('Role'),

        phone: Joi.string()
        .trim()
        .regex(/^[0-9]{10}$/)
        .messages({'string.pattern.base': `Enter 10 digit valid mobile number.`})
        .required()
        .label('Mobile'),
    
        password: Joi.string()
            .pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'))
            .messages({'string.pattern.base': 'Password must contain atleast 1 Uppercase, 1 Lowercase, 1 Number, and 1 special character and must be atleast 6 characters long.'})
            .label('Password'),
    
        confirmPassword: Joi.any()
        .equal(Joi.ref('password')).required().label('Confirm password')
        .messages({ 'any.only': 'Password and Confirm Password does not match' })
    }).with('password', 'confirmPassword'),

    departmentSchema: Joi.object({
        name: Joi.string().trim().min(3).max(100).required().label('Department Name'),
        status: Joi.string().trim().min(3).max(100).required().label('Status').valid('Active', 'Inactive'),
        description: Joi.string().trim().min(3).max(1000).allow('').label('Description'),
    }),

    designationSchema: Joi.object({
        name: Joi.string().trim().min(3).max(100).required().label('Designation Name'),
        status: Joi.string().trim().min(3).max(100).required().label('Status').valid('Active', 'Inactive'),
        description: Joi.string().trim().min(3).max(1000).allow('').label('Description'),
    }),

    jobTypeSchema: Joi.object({
        name: Joi.string().trim().min(3).max(100).required().label('Job Type Name'),
        status: Joi.string().trim().min(3).max(100).required().label('Status').valid('Active', 'Inactive'),
        description: Joi.string().trim().min(3).max(1000).allow('').label('Description'),
    }),


    qualificationSchema: Joi.object({
        name: Joi.string().trim().min(3).max(100).required().label('Qualification Name'),
        status: Joi.string().trim().min(3).max(100).required().label('Status').valid('Active', 'Inactive'),
        description: Joi.string().trim().min(3).max(1000).allow('').label('Description'),
    }),
}