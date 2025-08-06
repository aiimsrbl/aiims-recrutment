'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
let config = require('./src/config/config');
const app = express();
const { putEntry } = require('./src/utils/operation.js')
// Enable helmet in production
if (app.get('env') === 'production') {
    app.use(helmet());
}

// Setup views and static files
app.set('trust proxy', 1);
app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(fileUpload({ parseNested: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));

// ✅ Import Redis client from separate file
const redisClient = require('./redisClient');

// Session config using connect-redis
const RedisStore = require('connect-redis')(session);
// app.use(
//     session({
//         key: config.session.key,
//         store: new RedisStore({ client: redisClient }),
//         secret: config.session.secret,
//         saveUninitialized: false,
//         resave: false,
//         cookie: {
//             domain: config.cookie.domain,
//             httpOnly: config.cookie.httpOnly,
//             maxAge: config.cookie.maxAge,
//         },
//     })
// );

app.use(
    session({
        key: config.session.key,
        store: new RedisStore({ client: redisClient }),
        secret: config.session.secret,
        saveUninitialized: false,
        resave: false,
        rolling: true, // 👈 Resets session expiration on each request
        cookie: {
            domain: config.cookie.domain,
            httpOnly: config.cookie.httpOnly,
            maxAge: config.cookie.maxAge, // e.g. 15 * 60 * 1000 for 15 mins
        },
    })
);


// Logging middleware
morgan.token('id', function getId(req) {
    return req.id;
});
app.use(assignId);
app.use(
    morgan('[:date[iso] #:id] \x1b[36mStarted\x1b[0m     :method  :remote-addr  :url', {
        immediate: true,
    })
);
app.use(
    morgan(
        '[:date[iso] #:id] \x1b[33mCompleted\x1b[0m   :status  :remote-addr  :url  :res[content-length] in :response-time ms'
    )
);

// Dev error handler
if (app.get('env') === 'development') {
    app.use(errorhandler());
}

// Passport setup
require('./src/config/passport')(app);

// Set user to template engine
app.use((req, res, next) => {
    res.locals.session = { user: req.user };
    next();
});



// / Session validation middleware


app.use(async (req, res, next) => {
    const userAgent = req.headers['user-agent'];
    if (!req.user) {
       
        return next(); // continue gracefully
    }

    try {
        const role = req.user.role;
        const userId = req.user.id;
        const sessionKey = `user-session:${userId}`;
        const storedSessionId = await redisClient.getAsync(sessionKey);

        console.log('🔑 Redis Key:', sessionKey);
        console.log('📦 Stored Session:', storedSessionId);
        console.log('🆔 Current Session:', req.sessionID);

        if (storedSessionId && storedSessionId !== req.sessionID) {
            req.logout(() => {
                req.session.destroy(async () => {
                    await putEntry(userId, 'Session Expired (Multiple Login)', userAgent);

                    if (role === 'MANAGEMENT') {
                        return res.redirect('/management/login?session=expired');
                    }

                    return res.redirect('/login?session=expired');
                });
            });
        } else {
            // 🔁 Refresh both mappings with new TTL
            await redisClient.setexAsync(sessionKey,5*60,req.sessionID); // user → session
            return next();
        }
    } catch (err) {
        console.error('❗ Session check error:', err);
        return res.redirect('/login?session=expired');
    }
});



// Routes
require('./src/routes')(app);

// Assign a unique ID to every request
function assignId(req, res, next) {
    req.id = uuidv4();
    next();
}

// ✅ Export app only (Redis client now imported separately)
module.exports =  app ;
