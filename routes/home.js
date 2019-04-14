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
    let app = this;

    res.render('mainCalendarPage', {
        app: app,
        req: req,
        res: res
    });
}

function handleChangeUserType(req, res, next){
    let app = this;
    let changedType = 0;
    if (1==req.body.userType){
        log.debug("was premium so new type is 0")
    }
    else{
        changedType=1;
        log.debug("was not premium so type is now 1")
    }
    user.changeUserType(app.locals.db, res.locals.user.id, changedType, (result) =>
    {
        if(result !== null)
        {
            log.debug(result);
            res.send(result);
        }
        else
        {
            log.debug("succesfully changed type to: "+changedType.toString())
            res.send("success");
        }
    });
}

//function updateUserInfo(db, userID, newName, newPassword, newEmail, cb)

function handleChangeUserInfo(req,res,next){
    let app = this;

    log.debug("attempting to change password to: "+req.body.newPassword);

    user.updateUserInfo(app.locals.db, res.locals.user.id,res.locals.user.username, req.body.newPassword,res.locals.user.email, (result) =>
    {
        if(result !== null)
        {
            log.debug(result);
            res.send(result);
        }
        else
        {
            log.debug("succesfully changed password to: "+req.body.newPassword)
            res.send("success");
        }
    });
}

function handleGetOwnCalendars(req, res, next){
    let app = this;
    calendar.getOwnedCalendars(app.locals.db, res.locals.user.id, (err, calendars) =>
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
    calendar.getEditableCalendars(app.locals.db, res.locals.user.id, (err, calendars) =>
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
    calendar.getViewableCalendars(app.locals.db, res.locals.user.id, (err, calendars) =>
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
    calendar.addCalendar(app.locals.db, req.body.name, res.locals.user.id, (err) =>
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
    calendar.updateCalendar(app.locals.db, req.body.id, res.locals.user.id, req.body.name, (result) =>
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
    calendar.removeCalendar(app.locals.db, req.body.id, res.locals.user.id, (result) =>
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
    let app = this;
    calendar.getEditors(app.locals.db, req.body.id, (err, results) =>
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

function handleGetUsersWithViewPermissions(req, res, next){
    let app = this;
    calendar.getViewers(app.locals.db, req.body.id, (err, results) =>
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

function handleSearchUsers(req, res, next){
    let app = this;
    user.searchUsers(app.locals.db, res.locals.user.id, req.body.searchTerm, (err, results) =>
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

function handleAddEditCalendarUser(req, res, next){
    let app = this;
    calendar.grantEditPrivileges(app.locals.db, res.locals.user.id, req.body.userID, req.body.calendarID, (result) =>{
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

function handleAddViewCalendarUser(req, res, next){
    let app = this;
    calendar.grantViewPrivileges(app.locals.db, res.locals.user.id, req.body.userID, req.body.calendarID, (result) =>{
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

function handleRemoveCalendarUserSharePermissions(req, res, next){
    let app = this;
    calendar.revokePrivileges(app.locals.db, res.locals.user.id, req.body.userID, req.body.calendarID, (result) =>{
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

function handleAddEvent(req, res, next){
    let app = this;
    event.addEvent(app.locals.db, req.body.calendarID, res.locals.user.id, req.body.eventName, req.body.startDate, req.body.endDate, req.body.eventDescription, (result) =>
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
    event.getEvents(app.locals.db, req.body.calendarID, res.locals.user.id, req.body.rangeBegin, req.body.rangeEnd, (err, results) =>
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

function handleEditEvent(req, res, next){
    let app = this;
    event.editEvent(app.locals.db, req.body.calendarID, res.locals.user.id, req.body.eventID, req.body.startDate, req.body.endDate, req.body.eventName, req.body.eventDescription, (result) =>
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
    event.removeEvent(app.locals.db, req.body.calendarID, res.locals.user.id, req.body.eventID, (result) =>
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
    app.get('/getViewCalendars', handleGetViewCalendars.bind(app));
    app.get('/getEditCalendars', handleGetEditCalendars.bind(app));
    app.post('/getEvents', handleGetEvents.bind(app));

    app.post('/addCalendar', handleAddCalendar.bind(app));
    app.post('/editCalendar', handleEditCalendar.bind(app));
    app.post('/deleteCalendar', handleDeleteCalendar.bind(app));

    app.post('/getCalendarEditUsers', handleGetUsersWithEditPermissions.bind(app));
    app.post('/getCalendarViewUsers', handleGetUsersWithViewPermissions.bind(app));
    app.post('/searchUsers', handleSearchUsers.bind(app));
    app.post('/shareCalendarAddEditUser', handleAddEditCalendarUser.bind(app));
    app.post('/shareCalendarAddViewUser', handleAddViewCalendarUser.bind(app));
    app.post('/removeUserAccessPermissions', handleRemoveCalendarUserSharePermissions.bind(app));

    app.post('/addEvent', handleAddEvent.bind(app));
    app.post('/editEvent', handleEditEvent.bind(app));
    app.post('/removeEvent', handleRemoveEvent.bind(app));

    app.post('/changeUserType', handleChangeUserType.bind(app));
    app.post('/changeUserInfo', handleChangeUserInfo.bind(app));
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
    handleAddEditCalendarUser: handleAddEditCalendarUser,
    handleAddViewCalendarUser: handleAddViewCalendarUser,
    handleRemoveCalendarUserSharePermissions: handleRemoveCalendarUserSharePermissions,

    handleAddEvent: handleAddEvent,
    handleGetEvents: handleGetEvents,
    handleEditEvent: handleEditEvent,
    handleRemoveEvent: handleRemoveEvent,

    handleChangeUserType: handleChangeUserType,
    handleChangeUserInfo: handleChangeUserInfo,
};
