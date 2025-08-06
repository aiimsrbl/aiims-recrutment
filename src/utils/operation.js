const UAParser = require('ua-parser-js');
const userLogs = require("../model/user-logs");
module.exports = {

    putEntry: async function (user_id,status_type,userAgent) {

        const parser = new UAParser();
        parser.setUA(userAgent);
        const ua = parser.getResult();
        const browser = ua.browser.name || 'Unknown';
        const os = ua.os.name || 'Unknown';
        const deviceType = ua.device.type || 'desktop';
        const browser_version = ua.browser.version;
        const os_version = ua.os.version;
        const log = new userLogs({ user_id, browser: browser, os: os, status_type, device: deviceType, browser_version, os_version })
        await log.save();
    }

}