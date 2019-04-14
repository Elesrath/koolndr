/**
 * Routes for serving the login/authentication pages
 */

const cookie = require('cookie');
const url = require('url');

const authentication = require(`${__rootname}/utils/authentication.js`);
const log = require(`${__rootname}/utils/log.js`);
const conf = require(`${__rootname}/conf.json`);


/**
 * Handle a GET to the login page
 * @function handleLoginPage
 * @memberof routes.login
 * @param {IncomingMessage} req - the request
 * @param {OutgoingMessage} res - the response
 * @param {function} next - the next routing handler
 */
function handleLoginPage(req, res, next) {
    let app = this;
    res.render('login', {
        req: req,
        res: res,
        app: app
    });
    next();
}

/**
 * Handle a logout action
 * @function handleLogout
 * @memberof routes.login
 * @param {IncomingMessage} req - the request
 * @param {OutgoingMessage} res - the response
 * @param {function} next - the next routing handler
 */
function handleLogout(req, res, next) {
    let app = this;
    authentication.deleteSession(app.locals.db, res.locals.user.id, () => {
        res.redirect('/');
    });
}

/**
 * Handle a POST to the login page
 * @function handleLoginAttempt
 * @memberof routes.login
 * @param {IncomingMessage} req - the request
 * @param {OutgoingMessage} res - the response
 * @param {function} next - the next routing handler
 */
function handleLoginAttempt(req, res, next) {
    let app = this;

    authentication.authenticate(app.locals.db, req.body.username, req.body.password, (err, uuid, username) => {
        if (err) {
            log.error(err);
            res.render('login', {
                req: req,
                res: res,
                app: app,
                error: 'An error occurred.'
            });
            next();
            return;
        }

        if (!uuid || !username) {
            res.render('login', {
                req: req,
                res: res,
                app: app,
                error: 'Username or password was incorrect'
            });
            next();
            return;
        }

        authentication.createSession(app.locals.db, uuid, (err, session) => {
            if (err) {
                log.error(err);
                res.render('login', {
                    req: req,
                    res: res,
                    app: app,
                    error: 'An error occurred.'
                });
                next();
                return;
            }

            res.locals.user = {
                id: uuid,
                username: username,
                session: session
            };

            res.setHeader('set-cookie', cookie.serialize('session', session, {
                httpOnly: true,
                maxAge: conf.sessionLength
            }));

            if (req.query.hasOwnProperty('dest')) {
                res.redirect(301, url.parse(req.query.dest).href);
            } else {
                res.redirect(302, '/');
            }
        });
    });
}

/**
 * Load the routes in this file
 * @function load
 * @memberof routes.login
 * @param {ExpressApp} app - the express app
 */
function load(app) {
    app.get('/login', handleLoginPage.bind(app));
    app.post('/login', handleLoginAttempt.bind(app));
    app.get('/logout', handleLogout.bind(app));
}

/**
 * @namespace routes.login
 */
module.exports = {
    load: load,
    handleLoginPage: handleLoginPage,
    handleLoginAttempt: handleLoginAttempt
};
