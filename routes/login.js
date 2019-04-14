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
 * Handle a POST to the newaccount page
 * @function handleNewAccount
 * @memberof routes.login
 * @param {IncomingMessage} req - the request
 * @param {OutgoingMessage} res - the response
 * @param {function} next - the next routing handler
 */
function handleNewAccount(req, res, next) {
    let app = this;
    app.locals.db.query('SELECT LOWER(username) FROM USERS', (err, rows) => {
        if (err) {
            log.error(err);
            res.render('login', {
                req: req,
                res: res,
                app: app,
                error: 'An error occurred.'
            });
            return;
        }

        if (req.body.username && req.body.password && req.body.email) {
            let username = req.body.username.toLowerCase().trim();
            let password = req.body.password.trim();
            let email = req.body.email.toLowerCase().trim();

            if (!username || !password || !email) {
                res.render('login', {
                    req: req,
                    res: res,
                    app: app,
                    error: 'A username, password, and email are required'
                });
                return;
            }

            if (/ /.test(username)) {
                res.render('login', {
                    req: req,
                    res: res,
                    app: app,
                    error: 'The username may not contain a space'
                });
                return;
            }

            for (let row of rows) {
                if (row['LOWER(username)'] === username) {
                    res.render('login', {
                        req: req,
                        res: res,
                        app: app,
                        error: 'This username has already been taken'
                    });
                    return;
                }
            }

            authentication.createUser(app.locals.db, username, password, email, (err) => {
                res.render('login', {
                    req: req,
                    res: res,
                    app: app,
                    error: 'Account created.'
                });
                return;
            });
        } else {
            res.render('login', {
                req: req,
                res: res,
                app: app,
                error: 'A username, password, and email are required'
            });
            return;
        }
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
    app.post('/newaccount', handleNewAccount.bind(app));
    app.get('/newaccount', handleLoginPage.bind(app));
}

/**
 * @namespace routes.login
 */
module.exports = {
    load: load,
    handleLoginPage: handleLoginPage,
    handleLoginAttempt: handleLoginAttempt,
    handleNewAccount: handleNewAccount
};
