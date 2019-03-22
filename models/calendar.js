//Calendar Stuff

const log = require(`${__rootname}/utils/log.js`);

//This is how User.js is used successfully
/*
const user = require(`${__rootname}/models/user.js`);

user.getUserById(app.locals.db, uuid, (usr) => {
    app.locals.user = usr;
    res.redirect(301, '/');
});
*/

//How To use this function successfully:
/*
//At Beginning of Class:
const calendar = require(`${__rootname}/models/calendar.js`);

//Call the function itself
calendar.addCalendar(app.locals.db, "TestyMcTestFace", "123", (err, success) =>
{
    if(err)
    {
        log.debug("An error occured in test call of addCalendar");
        log.debug(err);
    }
    if(success)
    {
        log.debug("Add Calendar called successfully");
    }
    else
    {
        log.debug("Add Calendar failed");
    }
});
*/

/**
 * Adds a new calendar to the database
 * @param db initialized database connection
 * @param name name of the new calendar. Cannot be null
 * @param ownerID uuid of the creating user. Cannot be null. Must be a valid uuid. Will eventually need to belong to a premium user
 * @param cb callback that returns an error message and success/failure
 */
function addCalendar(db, name, ownerID, cb)
{
    log.debug("Adding Calendar with:\nname: " + name + "\nownerID: " + ownerID);

    //TODO check to make sure user is a primary user first!
    //TODO sanitize input

    db.query(`INSERT INTO calendars(ownerID, name) VALUES(?,?)`, [ownerID, name], (err) =>
    {
        if (err)
        {

            if(err.sqlMessage.includes("a foreign key constraint fails"))
            {
                log.debug("addCalendar called with suspected bad uuid");
            }
            cb(err.sqlMessage, false);
        }
        else
        {
            cb(null, true);
        }
    });
}

/**
 * Gets a list of all calendars that the given uuid can edit/view
 * @param db initialized database connection
 * @param userID uuid of user
 * @param edit if true, look for all calendars that user can edit. If false, all that user can view
 * @param cb callback that returns error messages and results
 */
function getCalendars(db, userID, edit, cb)
{
    if(edit)
    {
        log.debug("Getting calendars editable by " + userID);
        db.query(`SELECT calendars.calendarID, calendars.name FROM calendars, canViewEdit WHERE calendars.ownerID = ? OR
         calendars.calendarID = canViewEdit.calendarID AND canViewEdit.canEdit = TRUE AND canViewEdit.userID = ?`, [userID, userID], (err, res) =>
        {
            if(err)
            {
                log.debug(err);
                cb(err, null);
            }
            else
            {
                log.debug(res);
                cb(null, res);
            }
        });
    }
    else
    {
        log.debug("Getting calendars viewable by " + userID);
        db.query(`SELECT calendars.calendarID, calendars.name FROM calendars, canViewEdit WHERE
         calendars.calendarID = canViewEdit.calendarID AND canViewEdit.canEdit = FALSE AND canViewEdit.userID = ?`, [userID], (err, res) =>
        {
            if(err)
            {
                log.debug(err);
                cb(err, null);
            }
            else
            {
                log.debug(res);
                cb(null, res);
            }
        });
    }
}

/**
 * Returns any events that occur on the given calendar within 42 days of startDate (inclusive). This is sufficient to
 * display one month on the calendar (6 rows * 7 columns), plus enough of the previous and next months to fill in the
 * gaps on the calendar.
 *
 * Will return a json object of a full calendar month. For example, for March 2019, the start date would be Feb 24th,
 * and the calendar would cover until April 6th (inclusive). For example, see below function
 * @param db initialized database connection
 * @param startDate date to be displayed in the top-left cell of the calendar page. Will return events within 42 days
 * @param calendarID calendar to gather events from
 * @param userID uuid of user who can view the calendar
 * @param cb callback returns json with all events
 */
function getCalendarMonth(db, startDate, calendarID, userID, cb)
{
    //TODO stub function
    cb("Stub Function", null);
}

/*
result = {
    "monthTitle": "March 2019",
    "days":
        [
            {
                "day": "24",
                "month": "Feb",
                "events":
                    [

                    ]
            },
            {
                "day": "25",
                "month": "Feb",
                "events":
                    [

                    ]
            },
            {
                "day": "26",
                "month": "Feb",
                "events":
                    [

                    ]
            },
            ...
                {
                    "day": "6",
                    "month": "Apr",
                    "events":
                        [

                        ]
                }
        ]
};
*/

/**
 * The user identified by sharerID grants the user represented by recipientID viewing privileges
 * @param db initialized database connection
 * @param sharerID premium user with edit privileges on calendarID
 * @param recipientID user being granted viewing privileges
 * @param calendarID calendar to grant privileges to
 * @param cb callback
 */
function grantViewPrivileges(db, sharerID, recipientID, calendarID, cb)
{
    //TODO untested
    log.debug("Granting view privileges to " + recipientID + " by " + sharerID + " to calendar " + calendarID);
    db.query(`INSERT INTO canViewEdit(calendarID, userID, canEdit)
              SELECT ?, ?, FALSE
              FROM canViewEdit, calendars
              WHERE (calendars.calendarID = ? AND calendars.ownerID = ?) OR (canViewEdit.calendarID = ? AND canViewEdit.userID = ? AND canViewEdit.canEdit = TRUE)`, [calendarID, recipientID, calendarID, sharerID, calendarID, sharerID], (err, res) =>
    {
        if(err)
        {
            log.debug(err);
            cb(err, false);
        }
        else
        {
            log.debug(res);
            cb(null, true);
        }
    });
}

/**
 * The user identified by revokerID revokes the user represented by targetID viewing privileges
 * @param db initialized database connection
 * @param revokerID premium user with edit privileges on calendarID
 * @param targetID user being revoked viewing privileges
 * @param calendarID calendar to grant privileges to
 * @param cb callback
 */
function revokeViewPrivileges(db, revokerID, targetID, calendarID, cb)
{
    //TODO stub function
    cb("Stub Function", null);
}

/**
 * The user owner identified by ownerID grants the user represented by recipientID editing privileges
 * @param db initialized database connection
 * @param ownerID premium user that owns calendarID
 * @param recipientID user being granted editinging privileges
 * @param calendarID calendar to grant privileges to
 * @param cb callback
 */
function grantEditPrivileges(db, ownerID, recipientID, calendarID, cb)
{
    //TODO untested
    log.debug("Granting edit privileges to " + recipientID + " by " + ownerID + " to calendar " + calendarID);
    db.query(`INSERT INTO canViewEdit(calendarID, userID, canEdit)
              SELECT ?, ?, TRUE
              FROM canViewEdit, calendars
              WHERE (calendars.calendarID = ? AND calendars.ownerID = ?)`, [calendarID, recipientID, calendarID, ownerID], (err, res) =>
    {
        if(err)
        {
            log.debug(err);
            cb(err, false);
        }
        else
        {
            log.debug(res);
            cb(null, true);
        }
    });
}

/**
 * The user identified by ownerID revokes the user represented by targetID editing privileges
 * @param db initialized database connection
 * @param ownerID owner of calendarID
 * @param targetID user being revoked editing privileges
 * @param calendarID calendar to grant privileges to
 * @param cb callback
 */
function revokeEditPrivileges(db, ownerID, targetID, calendarID, cb)
{
    //TODO stub function
    cb("Stub Function", null);
}

/**
 * Update the name of calendar owned by owner
 * @param db initialized database connection
 * @param calendarID calendar to update
 * @param ownerID owner of calendar
 * @param name new name
 * @param cb callback
 */
function updateCalendar(db, calendarID, ownerID, name, cb)
{
    //TODO stub function
    cb("Stub Function", null);
}

/**
 * @namespace models.calendar
 */
module.exports = {
    addCalendar: addCalendar,
    getCalendars: getCalendars,
    getCalendarMonth: getCalendarMonth,
    grantViewPrivileges: grantViewPrivileges,
    grantEditPrivileges: grantEditPrivileges,
    revokeViewPrivileges: revokeViewPrivileges,
    revokeEditPrivileges: revokeEditPrivileges
};