"use strict"
const role = require('../../model/role.js');
const roleApi = require('../../api/role');
let roleController = {

    createRole: async function (req, res) {
        const { user_type } = req.body;

        const isExist = await role.findOne({
            user_type,

        });
        if (isExist) {
            return res.json({ msg: "Usertype already exist", status: false })
        }

        try {

            const rolecreation = new role({
                user_type,
                menu_items: [

                    {
                        menu_name: "Dashboard",
                        path: "/management/dashboard",
                        api_path: "/management/dashboard"
                    },

                    {
                        menu_name: "Advertisement",
                        path: "scroll1",
                        child: [
                            {
                                menu_name: "Create Adv",
                                path: "/management/create/advertisement",
                                api_path: "/management/create/advertisement"
                            },
                            {
                                menu_name: "view All Adv",
                                path: "/management/advertisement/all",
                                api_path: "/management/advertisement/all"
                            }

                        ]
                    },
                    {
                        menu_name: "Departments",
                        path: "scroll2",
                        child: [
                            {
                                menu_name: "Create Department",
                                path: "/management/create/department",
                                api_path: "/management/create/department"
                            },
                            {
                                menu_name: "view All Departments",
                                path: "/management/department/all",
                                api_path: "/management/department/all"
                            }

                        ]
                    },

                    {
                        menu_name: "Designations",
                        path: "scroll3",
                        child: [
                            {
                                menu_name: "Create Designations",
                                path: "/management/create/designation",
                                api_path: "/management/create/designation"

                            },
                            {
                                menu_name: "View All Designations",
                                path: "/management/designation/all",
                                api_path: "/management/designation/all"
                            }

                        ]
                    },
                    {
                        menu_name: "Job Types",
                        path: "scroll4",
                        child: [
                            {
                                menu_name: "Create Job Types",
                                path: "/management/create/job-type",
                                api_path: "/management/create/job-type"

                            },
                            {
                                menu_name: "View All Job Types",
                                path: "/management/job-type/all",
                                api_path: "/management/job-type/all"
                            }

                        ]
                    },
                    {
                        menu_name: "Qualifications",
                        path: "scroll5",
                        child: [
                            {
                                menu_name: "Create Qualifications",
                                path: "/management/create/qualification",
                                api_path: "/management/create/qualification"

                            },
                            {
                                menu_name: "View All Qualifications",
                                path: "/management/qualification/all",
                                api_path: "/management/qualification/all"
                            }

                        ]
                    },

                    {
                        menu_name: "Manage Vacancy",
                        path: "scroll6",
                        child: [
                            {
                                menu_name: "Create Vacancy",
                                path: "/management/create/job",
                                api_path: "/management/create/job"
                            },
                            {
                                menu_name: "View All Vacancy",
                                path: "/management/job/all",
                                api_path: ""
                            }

                        ]
                    },
                    {
                        menu_name: "Payment History",
                        path: "javascript:void(0);",
                        api_path: ""
                    },
                    {
                        menu_name: "Manage Applicants",
                        path: "scroll7",
                        child: [
                            {
                                menu_name: "All Applicants",
                                path: "/management/applicants/all",
                                api_path: "/management/applicants/all"
                            },
                            {
                                menu_name: "Paid Applicants",
                                path: "/management/applicants/paid",
                                api_path: "/management/applicants/paid"
                            },
                            {
                                menu_name: "Unpaid Applicants",
                                path: "/management/applicants/unpaid",
                                api_path: "/management/applicants/unpaid"
                            },
                            {
                                menu_name: "By Advertisement",
                                path: "/management/applicants/by/advertisement",
                                api_path: "/management/applicants/by/advertisement"
                            }

                        ]
                    },
                    {
                        menu_name: "Admin settings",
                        path: "scroll8",
                        child: [
                            {
                                menu_name: "Manage Roles",
                                path: "/management/roles",
                                api_path: "/management/roles"

                            },
                            {
                                menu_name: "User Logs",
                                path: "/management/user-logs",
                                api_path: "/management/user-logs"

                            },
                            {
                                menu_name: "Manage Profile",
                                path: "/1",
                                api_path: ""

                            },
                            {
                                menu_name: "Manage Users",
                                path: "/2",
                                api_path: ""
                            },
                            {
                                menu_name: "Change Password",
                                path: "/3",
                                api_path: ""
                            }


                        ]
                    }



                ]
            });
            await rolecreation.save();
            res.json({ msg: "Role created successfully", status: true });

        } catch (error) {

            console.log(error, "Role creation failed");
            res.json({ msg: "Role creation failed", status: false })
        }
    },
    updateRole: async function (req, res) {
        const { user_type_id, updated_data } = req.body;
        try {

            await role.updateOne({ _id: user_type_id }, { $set: { menu_items: updated_data } });
            res.json({ msg: "Role updated successfully", status: true });

        } catch (error) {

            console.log(error, "Role updation failed");
            res.json({ msg: "Role updation failed", status: false })
        }
    },
    deleteRole: async function (req, res) {
        const { user_type } = req.body;
        try {

            await role.deleteOne({ user_type });
            res.json({ msg: "Role deleted successfully", status: true });

        } catch (error) {

            console.log(error, "Role deletion failed");
            res.json({ msg: "Role deletion failed", status: false })
        }
    },
    getRole: async function (req, res) {



        try {

            const menu_bar = await role.findOne({ user_type: req.user.role });
            res.json({ menu_bar: menu_bar.menu_items, status: true });

        } catch (error) {

            console.log(error, "Can't get menu");
            res.json({ msg: "Can't get menu", status: false })
        }
    },
    fetchAll: function (req, res, next) {

        roleApi.fetchAll(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },
    delete: function (req, res, next) {

        if (!req.body.id && !req.body.id.length) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No id provided.'
                })
            );
        }

        roleApi.delete(req.body.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    },
    getRolebyId: function (req, res, next) {
        if (!req.body.id && !req.body.id.length) {
            return next(
                ec.appError({
                    status: ec.INVALID_PARAM,
                    message: 'No id provided.'
                })
            );
        }

        roleApi.getRolebyId(req.body.id, function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }


}

module.exports = roleController
