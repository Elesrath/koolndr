/**
 * Home page routes
 */

const calendar = require(`${__rootname}/models/calendar.js`);
const event = require(`${__rootname}/models/events.js`);
const user = require(`${__rootname}/models/user.js`);
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

function handleGetOwnCalendars(req, res, next){
    let app = this;
    calendar.getOwnedCalendars(app.locals.db, app.locals.user.id, (err, calendars) =>
    {
        if(err)
        {
            log.debug(err);
        }
        else
        {
            res.send(calendars);
        }
    });
}

function handleGetEditCalendars(req, res, next){
    let app = this;
    calendar.getEditableCalendars(app.locals.db, app.locals.user.id, (err, calendars) =>
    {
        if(err)
        {
            log.debug(err);
        }
        else
        {
            res.send(calendars);
        }
    });
}

function handleGetViewCalendars(req, res, next){
    let app = this;
    calendar.getViewableCalendars(app.locals.db, app.locals.user.id, (err, calendars) =>
    {
        if(err)
        {
            log.debug(err);
        }
        else
        {
            res.send(calendars);
        }
    });
}

function handleAddCalendar(req, res, next){
    let app = this;
    calendar.addCalendar(app.locals.db, req.body.name, app.locals.user.id, (err) =>
    {
        if(err)
        {
            log.debug(err);
            res.send(err);
        }
        else
        {
            res.send("success");
        }
    });
}

function handleEditCalendar(req, res, next){
    let app = this;
    calendar.updateCalendar(app.locals.db, req.body.id, app.locals.user.id, req.body.name, (result) =>
    {
        if(result !== null)
        {
            log.debug(result);
            res.send(result);
        }
        else
        {
            res.send("success");
        }
    });
}

function handleDeleteCalendar(req, res, next){
    let app = this;
    calendar.removeCalendar(app.locals.db, req.body.id, app.locals.user.id, (result) =>
    {
        if(result !== null)
        {
            log.debug(result);
            res.send(result);
        }
        else
        {
            res.send("success");
        }
    });
}

function handleGetUsersWithEditPermissions(req, res, next){

}

function handleGetUsersWithViewPermissions(req, res, next){

}

function handleSearchUsers(req, res, next){
    let app = this;
    user.searchUsers(app.locals.db, app.locals.user.id, req.body.searchTerm, (err, results) =>
    {
        if(err)
        {
            log.debug(err);
        }
        else
        {
            res.send(results);
        }
    });
}

function handleAddEvent(req, res, next){
    let app = this;
    event.addEvent(app.locals.db, req.body.calendarID, app.locals.user.id, req.body.eventName, req.body.startDate, req.body.endDate, req.body.eventDescription, (result) =>
    {
        if(result !== null)
        {
            log.debug(result);
            res.send(result);
        }
        else
        {
            res.send("success");
        }
    });
}

function handleGetEvents(req, res, next){
    let app = this;
    event.getEvents(app.locals.db, req.body.calendarID, app.locals.user.id, req.body.rangeBegin, req.body.rangeEnd, (err, results) =>
    {
        if(err)
        {
            log.debug(result);
        }
        else
        {
            res.send(results);
        }
    });
}

function handleEditEvent(req, res, next){
    let app = this;
    event.editEvent(app.locals.db, req.body.calendarID, app.locals.user.id, req.body.eventID, req.body.startDate, req.body.endDate, req.body.eventName, req.body.eventDescription, (result) =>
    {
        if(result !== null)
        {
            log.debug(result);
            res.send(result);
        }
        else
        {
            res.send("success");
        }
    });
}

function handleRemoveEvent(req, res, next){
    let app = this;
    event.removeEvent(app.locals.db, req.body.calendarID, app.locals.user.id, req.body.id, (result) =>
    {
        if(result !== null)
        {
            log.debug(result);
            res.send(result);
        }
        else
        {
            res.send("success");
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
    app.get('/getOwnCalendars', handleGetOwnCalendars.bind(app));
    app.get('/getViewCalendars', handleGetEditCalendars.bind(app));
    app.get('/getEditCalendars', handleGetViewCalendars.bind(app));
    app.post('/getEvents', handleGetEvents.bind(app));
    app.post('/addCalendar', handleAddCalendar.bind(app));
    app.post('/editCalendar', handleEditCalendar.bind(app));
    app.post('/deleteCalendar', handleDeleteCalendar.bind(app));
    app.post('/editUsers', handleGetUsersWithEditPermissions.bind(app));
    app.post('/viewUsers', handleGetUsersWithViewPermissions.bind(app));
    app.post('/searchUsers', handleSearchUsers.bind(app));
    app.post('/addEvent', handleAddEvent.bind(app));
    app.post('/editEvent', handleEditEvent.bind(app));
    app.post('/removeEvent', handleRemoveEvent.bind(app));
}

/**
 * @namespace routes.home
 */
module.exports = {
    load: load,
    handleHomePage: handleHomePage,
    handleGetOwnedCalendars: handleGetOwnCalendars,
    handleGetEditCalendars: handleGetEditCalendars,
    handleGetViewCalendars: handleGetViewCalendars,
    handleAddCalendar: handleAddCalendar,
    handleEditCalendar: handleEditCalendar,
    handleDeleteCalendar: handleDeleteCalendar,
    handleGetUsersWithEditPermissions: handleGetUsersWithEditPermissions,
    handleGetUsersWithViewPermissions: handleGetUsersWithViewPermissions,
    handleSearchUsers: handleSearchUsers,
    handleAddEvent: handleAddEvent,
    handleGetEvents: handleGetEvents,
    handleEditEvent: handleEditEvent,
    handleRemoveEvent: handleRemoveEvent,
};
