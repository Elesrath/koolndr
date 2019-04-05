/**
 * Home page routes
 */

const calendar = require(`${__rootname}/models/calendar.js`);
const log = require(`${__rootname}/utils/log.js`);

 /**
  * Handle a GET to the login page
  * @function handleLoginPage
  * @memberof routes.login
  * @param {IncomingMessage} req - the request
  * @param {OutgoingMessage} res - the response
  * @param {function} next - the next routing handler
  */
function handleHomePage(req, res, next) {
    res.render('mainCalendarPage', {
        app: this,
        req: req
    });
}

function handleGetCalendars(req, res, next){
    let app = this;
    calendar.getOwnedCalendars(app.locals.db, app.locals.user.id, (err, calendars) =>
    {
        log.debug(calendars);
        if(err)
        {
            log.debug(err);
        }
        else if(calendars)
        {
            res.send(calendars);
        }
        else
        {
            log.debug("There are no owned calendars for user " + app.locals.user.id);
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
    app.get('/home', handleHomePage.bind(app));
    app.get('/', handleHomePage.bind(app));
    app.get('/getCalendars', handleGetCalendars.bind(app));
}

/**
 * @namespace routes.home
 */
module.exports = {
    load: load,
    handleHomePage: handleHomePage,
    handleGetCalendars: handleGetCalendars
};
