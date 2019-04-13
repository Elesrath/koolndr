//Calendar Stuff

const log = require(`${__rootname}/utils/log.js`);

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
        if (err)
        {
            cb(err.sqlMessage);
        }
        else if (!row[0])
        {
            cb("Error: User " + ownerID + " is not a premium user and therefore cannot create calendars");
        }
        else
        {
            db.query(`INSERT INTO calendars(ownerID, name) VALUES(?,?)`, [ownerID, name], (err) =>
            {
                if (err)
                {

                    if (err.sqlMessage.includes("a foreign key constraint fails"))
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
            SELECT calendarID, name
            FROM calendars
            WHERE ownerID = ?`,
                    [userID], (err, result) =>
                    {
                        if (err)
                        {
                            cb(err.sqlMessage, null);
                        }
                        else if (!result[0]) //User has no premium calendars
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
            if (err)
            {
                cb(err.sqlMessage, null);
            }
            else if (!row[0]) //There are no viewable calendars
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
 * Note that you do not need to revoke any previous permissions the target may have had
 * @param db initialized database connection
 * @param sharerID premium user with edit privileges on calendarID
 * @param recipientID user being granted viewing privileges
 * @param calendarID calendar to grant privileges to
 * @param cb callback
 */
function grantViewPrivileges(db, sharerID, recipientID, calendarID, cb)
{
    db.query(
        `SELECT 1
        FROM calendars
        WHERE calendarID = ? AND ownerID = ?
        UNION
        SELECT 1
        FROM canViewEdit
        WHERE calendarID = ? AND userID = ? AND canEdit = TRUE`,
        [calendarID, sharerID, calendarID, sharerID], (err, row) =>
        {
            if (err)
            {
                cb(err.sqlMessage);
            }
            else if (!row[0])
            {
                cb("Error: user " + sharerID + " does not have edit privileges on calendar " + calendarID);
            }
            else
            {
                db.query(
                    `SELECT 1
                FROM canViewEdit
                WHERE userID = ? AND calendarID = ?`,
                    [recipientID, calendarID], (err, row) =>
                    {
                        if (err)
                        {
                            cb(err.sqlMessage);
                        }
                        else if (!row[0])
                        {
                            //recipient does not already exist in table, so add them
                            db.query(
                                `INSERT INTO canViewEdit(calendarID, userID, canEdit)
                        VALUES (?, ?, FALSE)`,
                                [calendarID, recipientID], (err) =>
                                {
                                    if (err)
                                    {
                                        cb(err.sqlMessage);
                                    }
                                    else
                                    {
                                        cb(null);
                                    }
                                });
                        }
                        else
                        {
                            //recipient already exists in table, so update them
                            //This is the same as demoting them to view only
                            db.query(
                                `UPDATE canViewEdit
                        SET canEdit = FALSE
                        WHERE calendarID = ? AND userID = ?`,
                                [calendarID, recipientID], (err) =>
                                {
                                    if (err)
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
        });
}

/**
 * The user owner identified by ownerID grants the user represented by recipientID editing privileges
 * Note that you do not need to revoke any previous permissions the user may have had
 * @param db initialized database connection
 * @param sharerID premium user with edit privileges on calendarID
 * @param recipientID user being granted editinging privileges
 * @param calendarID calendar to grant privileges to
 * @param cb callback
 */
function grantEditPrivileges(db, sharerID, recipientID, calendarID, cb)
{
    db.query(
        `SELECT 1
        FROM calendars
        WHERE calendarID = ? AND ownerID = ?
        UNION
        SELECT 1
        FROM canViewEdit
        WHERE calendarID = ? AND userID = ? AND canEdit = TRUE`,
        [calendarID, sharerID, calendarID, sharerID], (err, row) =>
        {
            if (err)
            {
                cb(err.sqlMessage);
            }
            else if (!row[0])
            {
                cb("Error: user " + sharerID + " does not have edit privileges on calendar " + calendarID);
            }
            else
            {
                db.query(
                    `SELECT 1
                FROM canViewEdit
                WHERE userID = ? AND calendarID = ?`,
                    [recipientID, calendarID], (err, row) =>
                    {
                        if (err)
                        {
                            cb(err.sqlMessage);
                        }
                        else if (!row[0])
                        {
                            //recipient does not already exist in table, so add them
                            db.query(
                                `INSERT INTO canViewEdit(calendarID, userID, canEdit)
                        VALUES (?, ?, TRUE)`,
                                [calendarID, recipientID], (err) =>
                                {
                                    if (err)
                                    {
                                        cb(err.sqlMessage);
                                    }
                                    else
                                    {
                                        cb(null);
                                    }
                                });
                        }
                        else
                        {
                            //recipient already exists in table, so update them
                            //This is the same as demoting them to view only
                            db.query(
                                `UPDATE canViewEdit
                        SET canEdit = TRUE
                        WHERE calendarID = ? AND userID = ?`,
                                [calendarID, recipientID], (err) =>
                                {
                                    if (err)
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
        });
}

/**
 * The user identified by revokerID revokes the user represented by targetID access privileges
 * This works regardless of what kind of access the target had. You do not need to do this if
 * you want to change their access level, just grant them the desired type of privileges
 * @param db initialized database connection
 * @param revokerID premium user with edit privileges on calendarID
 * @param targetID user being revoked privileges
 * @param calendarID calendar to revoke privileges to
 * @param cb callback
 */
function revokePrivileges(db, revokerID, targetID, calendarID, cb)
{
    db.query(
        `SELECT 1
        FROM calendars
        WHERE calendarID = ? AND ownerID = ?
        UNION
        SELECT 1
        FROM canViewEdit
        WHERE calendarID = ? AND userID = ? AND canEdit = TRUE`,
        [calendarID, revokerID, calendarID, revokerID], (err, row) =>
        {
            if (err)
            {
                cb(err.sqlMessage);
            }
            else if (!row[0])
            {
                cb("Error: user " + revokerID + " does not have edit privileges on calendar " + calendarID);
            }
            else
            {
                db.query(
                    `DELETE
                    FROM canViewEdit
                    WHERE userID = ? AND calendarID = ?`,
                    [targetID, calendarID], (err) =>
                    {
                        if (err)
                        {
                            cb(err.sqlMessage);
                        }
                        else
                        {
                            cb(null);
                        }
                    }
                )
            }
        });
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
    db.query(
        `SELECT 1
        FROM users
        INNER JOIN calendars ON calendars.ownerID = users.uuid
        WHERE users.uuid = ? AND users.userType = 1 AND calendars.calendarID = ?`,
        [ownerID, calendarID], (err, row) =>
        {
            if (err)
            {
                cb(err.sqlMessage);
            }
            else if (!row[0])
            {
                cb("Error: user does not own calendar, or userId or calendarId does not exist");
            }
            else
            {
                db.query(
                    `UPDATE calendars
                    SET name = ?
                    WHERE ownerID = ? AND calendarID = ?`,
                    [name, ownerID, calendarID], (err) =>
                    {
                        if (err)
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
        INNER JOIN calendars 
        ON calendars.ownerID = users.uuid
        WHERE users.uuid = ? AND users.userType = 1 AND calendars.calendarID = ?`,
        [ownerID, calendarID], (err, row) =>
        {
            if (err)
            {
                cb(err.sqlMessage);
            }
            else if (!row[0])
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
                        if (err)
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

/**
 * Returns a list of all userID's that have viewing privileges on calendarID
 * @param db initialized database connection
 * @param calendarID calendar to search
 * @param cb callback
 */
function getViewers(db, calendarID, cb)
{
    db.query(
        `SELECT users.uuid, users.username
        FROM users
        INNER JOIN canViewEdit 
        ON users.uuid = canViewEdit.userID
        WHERE canViewEdit.calendarID = ? AND canViewEdit.canEdit = FALSE`,
        [calendarID], (err, result) =>
        {
            if (err)
            {
                cb(err.sqlMessage, null);
            }
            else
            {
                cb(null, result);
            }
        });
}

/**
 * Returns a list of all userID's that have editing privileges on calendarID
 * @param db initialized database connection
 * @param calendarID calendar to search
 * @param cb callback
 */
function getEditors(db, calendarID, cb)
{
    db.query(
        `SELECT users.uuid, users.username
        FROM users
        INNER JOIN canViewEdit 
        ON users.uuid = canViewEdit.userID
        WHERE canViewEdit.calendarID = ? AND canViewEdit.canEdit = TRUE`,
        [calendarID], (err, result) =>
        {
            if (err)
            {
                cb(err.sqlMessage, null);
            }
            else
            {
                cb(null, result);
            }
        });
}

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
    revokePrivileges: revokePrivileges,
    updateCalendar: updateCalendar,
    removeCalendar: removeCalendar,
    getViewers: getViewers,
    getEditors: getEditors

};