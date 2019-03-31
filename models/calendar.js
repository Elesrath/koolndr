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
    db.query(`
    SELECT 1
    FROM users
    WHERE uuid = ? AND userType = 1`, [ownerID], (err, row) =>
    {
        if(err)
        {
            cb(err.sqlMessage);
        }
        else if(!row[0])
        {
            cb("Error: User " + ownerID + " is not a premium user and therefore cannot create calendars");
        }
        else
        {
            db.query(`INSERT INTO calendars(ownerID, name) VALUES(?,?)`, [ownerID, name], (err) =>
            {
                if (err)
                {

                    if(err.sqlMessage.includes("a foreign key constraint fails"))
                    {
                        log.debug("addCalendar called with suspected bad uuid");
                    }
                    cb(err.sqlMessage);
                }
                else
                {
                    cb(null);
                }
            });
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
    //TODO untested
    if(edit)
    {
        log.debug("Getting calendars editable by " + userID);
        db.query(`
        SELECT calendars.calendarID, calendars.name 
        FROM calendars, canViewEdit 
        WHERE calendars.ownerID = ? 
        OR calendars.calendarID = canViewEdit.calendarID AND canViewEdit.canEdit = TRUE AND canViewEdit.userID = ?`,
            [userID, userID], (err, res) =>
        {
            if(err)
            {
                cb(err.sqlMessage, null);
            }
            else
            {
                cb(null, res);
            }
        });
    }
    else
    {
        log.debug("Getting calendars viewable by " + userID);
        db.query(`
        SELECT calendars.calendarID, calendars.name 
        FROM calendars, canViewEdit 
        WHERE calendars.calendarID = canViewEdit.calendarID AND canViewEdit.canEdit = FALSE AND canViewEdit.userID = ?`,
            [userID], (err, res) =>
        {
            if(err)
            {
                cb(err.sqlMessage, null);
            }
            else
            {
                cb(null, res);
            }
        });
    }
}

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
              WHERE (calendars.calendarID = ? AND calendars.ownerID = ?) 
              OR (canViewEdit.calendarID = ? AND canViewEdit.userID = ? AND canViewEdit.canEdit = TRUE)`,
        [calendarID, recipientID, calendarID, sharerID, calendarID, sharerID], (err) =>
    {
        if(err)
        {
            cb(err.sqlMessage);
        }
        else
        {
            cb(null);
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
    //TODO untested
    log.debug("Revoking View Privileges from " + targetID + " for " + calendarID);
    db.query(`
    DELETE FROM canViewEdit 
    WHERE (calendarID = ? AND userID = ? AND canEdit = FALSE) 
    AND ((calendars.calendarID = ? AND calendars.ownerID = ?) 
    OR (calendarID = ? AND userID = ? AND canEdit = TRUE))`,
        [calendarID, targetID, calendarID, revokerID, calendarID, revokerID], (err, res) =>
    {
        if(err)
        {
            cb(err.sqlMessage);
        }
        else
        {
            cb(null);
        }
    });
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
            cb(err.sqlMessage);
        }
        else
        {
            cb(null);
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
 * Remove selected calendar
 * @param db initialized database connection
 * @param calendarID calendar to remove
 * @param ownerID owner of calendar
 * @param cb callback
 */
function removeCalendar(db, calendarID, ownerID, cb)
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
    grantViewPrivileges: grantViewPrivileges,
    grantEditPrivileges: grantEditPrivileges,
    revokeViewPrivileges: revokeViewPrivileges,
    revokeEditPrivileges: revokeEditPrivileges,
    updateCalendar: updateCalendar,
    removeCalendar: removeCalendar

};