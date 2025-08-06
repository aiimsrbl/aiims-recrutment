'use strict';

module.exports = function (app) {
    require('./recruitment')(app);
    require('./user')(app);
    require('./views')(app);

    app.get('/*', function (req, res) {
        res.status(404);
        res.render('commons/error-page.ejs', {
            statusCode: 404,
            error: 'Page Not Found',
            description: 'Oops!!!! you tried to access a page which is not available. go back to Home',
        });
    });
};
