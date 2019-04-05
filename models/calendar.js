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
 * Get all calendars owned by userID
 * @param db initialized database connection
 * @param userID user to check for ownership
 * @param cb callback
 */
function getOwnedCalendars(db, userID, cb)
{
    db.query(`
    SELECT 1
    FROM users
    WHERE uuid = ? AND userType = 1`,
        [userID], (err, row) =>
    {
        if(err)
        {
            cb(err.sqlMessage, null);
        }
        else if(!row[0]) //User is not premium
        {
            cb(null, null);
        }
        else
        {
            db.query(`
            SELECT calendarID, name
            FROM calendars
            WHERE ownerID = ?`,
                [userID], (err, result) =>
            {
                if(err)
                {
                    cb(err.sqlMessage, null);
                }
                else if(!result[0]) //User has no premium calendars
                {
                    cb(null, null);
                }
                else
                {
                    cb(null, result);
                }
            });
        }
    });
}

/**
 * Get all calendars viewable by userID. Note that this does not include calendars that userID owns or can edit
 * @param db initialized database connection
 * @param userID userId to search for
 * @param cb callback
 */
function getViewableCalendars(db, userID, cb)
{
    db.query(`
    SELECT calendars.calendarID, calendars.name
    FROM calendars
    INNER JOIN canViewEdit
    ON calendars.calendarID = canViewEdit.calendarID
    WHERE canViewEdit.userID = ? AND canViewEdit.canEdit = FALSE`,
        [userID], (err, row) =>
    {
        if(err)
        {
            cb(err.sqlMessage, null);
        }
        else if(!row[0]) //There are no viewable calendars
        {
            cb(null, null);
        }
        else
        {
            cb(null, row);
        }
    });
}

/**
 * Get all calendars editable by userID. Note that this does not include calendars that userID owns or can view
 * @param db initialized database connection
 * @param userID userId to search for
 * @param cb callback
 */
function getEditableCalendars(db, userID, cb)
{
    db.query(`
    SELECT 1
    FROM users
    WHERE uuid = ? AND userType = 1`,
        [userID], (err, row) =>
    {
        if (err)
        {
            cb(err.sqlMessage, null);
        }
        else if (!row[0]) //User is not premium
        {
            cb(null, null);
        }
        else
        {
            db.query(`
            SELECT calendars.calendarID, calendars.name
            FROM calendars
            INNER JOIN canViewEdit
            ON calendars.calendarID = canViewEdit.calendarID
            WHERE canViewEdit.userID = ? AND canViewEdit.canEdit = TRUE`,
                [userID], (err, row) =>
            {
                if (err)
                {
                    cb(err.sqlMessage, null);
                }
                else if (!row[0]) //There are no editable calendars
                {
                    cb(null, null);
                }
                else
                {
                    cb(null, row);
                }
            });
        }
    });
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
    //TODO stub function
    /*
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
    */
    cb("Stub function");
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
    //This almost certainly doesn't work!
    /*
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

     */
    cb("Stub function");
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
    //TODO stub function
    //This almost certainly doesn't work
    /*
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

     */
    cb("Stub function");
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
    db.query(
        `SELECT 1
        FROM users
        INNER JOIN calendars ON calendars.ownerID = users.uuid
        WHERE users.uuid = ? AND users.userType = 1 AND calendars.calendarID = ?`,
        [ownerID, calendarID], (err, row) =>
    {
        if(err)
        {
            cb(err.sqlMessage);
        }
        else if(!row[0])
        {
            cb("Error: user does not own calendar, or userId or calendarId does not exist");
        }
        else
        {
            db.query(
                `DELETE
                FROM calendars
                WHERE ownerID = ? AND calendarID = ?`,
                [ownerID, calendarID], (err) =>
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
    });
}

//

/**
 * @namespace models.calendar
 */
module.exports = {
    addCalendar: addCalendar,
    getOwnedCalendars: getOwnedCalendars,
    getViewableCalendars: getViewableCalendars,
    getEditableCalendars: getEditableCalendars,
    grantViewPrivileges: grantViewPrivileges,
    grantEditPrivileges: grantEditPrivileges,
    revokeViewPrivileges: revokeViewPrivileges,
    revokeEditPrivileges: revokeEditPrivileges,
    updateCalendar: updateCalendar,
    removeCalendar: removeCalendar

};