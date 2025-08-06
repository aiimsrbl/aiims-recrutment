'use strict';
const role = require('../../model/role.js');
const { putEntry } = require('../../utils/operation.js');
const redisClient = require('../../../redisClient.js')
var authenticate = {
    checkApplicantUser: function (req, res, next) {
        if (!req.user || req.user.role !== 'APPLICANT') {

            var ip = (
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress
            ).split(',')[0];
            console.log(
                'Unauthorised request. ' + req.method + ' ' + ip + ' ' + req.url
            );
            res.redirect('/logout');
        } else {
            return next();
        }
    },

    checkManagementUser: async function (req, res, next) {


        if (!req.user || req.user.role !== 'MANAGEMENT') {
            const userAgent = req.headers['user-agent'];
            const ip = (
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress
            ).split(',')[0];

            console.log('Unauthorised request. ' + req.method + ' ' + ip + ' ' + req.url);


            try {

                const currentSessionId = req.sessionID;

                // Scan all Redis keys that start with "user-session:"
                const sessionKeys = await redisClient.keysAsync("user-session:*");
                let cnt = 0;
                for (const key of sessionKeys) {
                    const storedSessionId = await redisClient.getAsync(key);
                   
                    if (storedSessionId && storedSessionId !== currentSessionId && cnt === 1) {
                        const userId = key.split(":")[1]; // extract from "user-session:<userId>"
                        await putEntry(userId, "Session Expired (Timeout)", userAgent);
                    }
                    cnt++;
                }


            } catch (err) {
                console.error("❗ Error handling expired session:", err);
            }

            return res.render('admin/sessionExpired.ejs');

        }
        else {

            return next();

        }
    },
    checkRoles: async function (req, res, next) {

        const currentPath = req.path;
        const assignedRole = await role.findOne({ user_type: 'MANAGEMENT' });
        if (!assignedRole) return res.redirect('/logout');
        let isAllowed = false;
        for (const menu of assignedRole.menu_items) {

            if (menu.api_path === currentPath && !menu.allowed) {
                isAllowed = true;
                break;
            }

            if (menu.child && menu.child.length > 0) {
                for (const child of menu.child) {
                    if (child.api_path === currentPath && !child.allowed) {
                        isAllowed = true;
                        break;
                    }
                }
            }

            if (isAllowed) break;
        }

        if (isAllowed) {
            // Show alert message and stay on the page

            return res.send(`
                <script>
                    alert("Sorry, you are not allowed to access this page.");
                    window.history.back();
                </script>
            `);
        }
        else {
            return next();
        }
    },
    checkAdminUser: function (req, res, next) {
        if (!req.user || req.user.role !== 'ADMINISTRATOR') {
            var ip = (
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress
            ).split(',')[0];
            console.log(
                'Unauthorised request. ' + req.method + ' ' + ip + ' ' + req.url
            );
            res.redirect('/logout');
        } else {
            return next();
        }
    },
};

module.exports = authenticate;
