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
function getCalendars(db, userID, edit,cb)
{
    //TODO stub function
    cb("Stub Function", null);
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
 * @namespace models.calendar
 */
module.exports = {
    addCalendar: addCalendar,
    getCalendars: getCalendars,
    getCalendarMonth: getCalendarMonth
};