const log = require(`${__rootname}/utils/log.js`);

/**
 * Adds an event to the given calendar
 * @param db initialized database calendar
 * @param calendarID calendarID of the calendar which the event is to be added to
 * @param userID uuid of user that can edit the calendar
 * @param eventName name of event
 * @param startDate start date of the event. Stored in MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
 * @param endDate end date of the event. Stored in MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
 * @param eventDescription description of the event. Might be stored in a file and db will store path... Maybe?
 * @param cb callback that returns the information
 */
function addEvent(db, calendarID, userID, eventName, startDate, endDate, eventDescription, cb)
{
    log.debug("Adding event called " + eventName + " to calendar " + calendarID);
    db.query(`
    SELECT 1
    FROM calendars
    WHERE (calendars.calendarID = ? AND calendars.ownerID = ?)
    UNION 
    SELECT 1
    FROM canViewEdit
    WHERE (canViewEdit.calendarID = ? AND canViewEdit.userID = ? AND canViewEdit.canEdit = TRUE)`,
        [calendarID, userID, calendarID, userID], (err, row) =>
    {
        if(err)
        {
            cb(err.sqlMessage);
        }
        else if(!row[0])
        {
            cb("Error: User " + userID + " not authorized to add event to calendar " + calendarID);
        }
        else
        {
            db.query(`INSERT INTO events(calendarID, startDate, endDate, eventName, eventDescription) VALUES (?, ?, ?, ?, ?)`,
                [calendarID, startDate, endDate, eventName, eventDescription], (err) =>
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

/**
 * Returns events on the given calendar within the given range
 * @param db initialized database connection
 * @param calendarID calendarID of the calendar to search
 * @param userID uuid of user who can view the calendar
 * @param rangeBegin date to start searching on (inclusive). MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
 * @param rangeEnd date to stop searching on (inclusive). MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
 * @param cb callback that returns the information
 */
function getEvents(db, calendarID, userID, rangeBegin, rangeEnd, cb)
{
    log.debug("Getting events from calendar " + calendarID + " for user " + userID + " From " + rangeBegin + " To " + rangeEnd);
    db.query(`
    SELECT 1
    FROM calendars
    WHERE (calendars.calendarID = ? AND calendars.ownerID = ?)
    UNION 
    SELECT 1
    FROM canViewEdit
    WHERE (canViewEdit.calendarID = ? AND canViewEdit.userID = ? AND canViewEdit.canEdit = TRUE)`,
        [calendarID, userID, calendarID, userID], (err, row) =>
    {
        if(err)
        {
            cb(err.sqlMessage, null);
        }
        else if(!row[0])
        {
            cb("Error: User " + userID + " not authorized to view calendar " + calendarID, null);
        }
        else
        {
            db.query(`
            SELECT events.*
            FROM events
            WHERE events.calendarID = ? AND (events.startDate BETWEEN ? AND ?)`,
                [calendarID, rangeBegin, rangeEnd], (err, row) =>
            {
                if(err)
                {
                    cb(err.sqlMessage, null);
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
 * Edit the selected event
 * @param db initialized database connection
 * @param calendarID calendarID that contains the event
 * @param userID uuid of user that can edit the calendar
 * @param eventID eventID of the event
 * @param newStart new start date of the event. Stored in MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
 * @param newEnd new end date of the event. Stored in MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
 * @param newName new name of the event
 * @param newDescription new description of the event
 * @param cb callback to return the information
 */
function editEvent(db, calendarID, userID, eventID, newStart, newEnd, newName, newDescription, cb)
{
    //TODO stub function
    cb("Stub Function", null);
}

/**
 * Remove selected event
 * @param db initialized database connection
 * @param calendarID calendar that contains the event
 * @param userID user with edit access on the calendar containing the event
 * @param eventID event to remove
 * @param cb callback
 */
function removeEvent(db, calendarID, userID, eventID, cb)
{
    //TODO stub function
    cb("Stub function", null);
}

/**
 * namespace module.event
 */
module.exports = {
    addEvent: addEvent,
    getEvents: getEvents,
    editEvent: editEvent,
    removeEvent: removeEvent
};