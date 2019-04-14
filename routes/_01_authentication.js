/**
 * Routes for ensuring a user is authenticated
 * @note this is 02 because it needs to run AFTER the static routes but before everything else
 */

const authentication = require(`${__rootname}/utils/authentication.js`);
const log = require(`${__rootname}/utils/log.js`);

const user = require(`${__rootname}/models/user.js`);

let unauthenticatedPages = /^\/(login|newaccount|forgotpassword|registerUser)\/?$/;

module.exports = {
    load: function(app) {
        app.all('*', (req, res, next) => {
            log.debug(`${req.method}: ${req._parsedUrl.pathname}`);
            if (req.cookies.session) {
                authentication.checkSession(app.locals.db, req.cookies.session, (err, uuid) => {
                    if (err) {
                        log.error(err);
                        throw err;
                    }

                    if (unauthenticatedPages.test(req._parsedUrl.pathname)) {
                        if (uuid) {
                            // user is already authenticated - redirect to home
                            user.getUserById(app.locals.db, uuid, (usr) => {
                                res.locals.user = usr;
                                res.redirect(301, '/');
                            });
                        } else {
                            // user does not need authentication for these pages
                            next();
                        }
                    } else if (uuid) {
                        // user is authenticated - let routing continue
                        user.getUserById(app.locals.db, uuid, (usr) => {
                            res.locals.user = usr;
                            next();
                        });
                    } else {
                        // user is not authenticated
                        res.redirect(301, `/login?dest=${encodeURIComponent(req._parsedUrl.href)}`);
                    }
                });
            } else {
                if (unauthenticatedPages.test(req._parsedUrl.pathname)) {
                    next();
                } else {
                    // user is not authenticated
                    res.redirect(301, `/login?dest=${encodeURIComponent(req._parsedUrl.href)}`);
                }
            }
        });
    }
}
