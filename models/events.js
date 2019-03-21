const log = require(`${__rootname}/utils/log.js`);

/**
 * Adds an event to the given calendar
 * @param db initialized database calendar
 * @param calendarID calendarID of the calendar which the event is to be added to
 * @param userID uuid of user that can edit the calendar
 * @param eventName name of event
 * @param startDate start date of the event
 * @param endDate end date of the event
 * @param eventDescription description of the event. Might be stored in a file and db will store path... Maybe?
 * @param cb callback that returns the information
 */
function addEvent(db, calendarID, userID, eventName, startDate, endDate, eventDescription, cb)
{
    //TODO stub function
    cb("Stub Function", null);
}

/**
 * Returns events on the given calendar within the given range
 * @param db initialized database connection
 * @param calendarID calendarID of the calendar to search
 * @param userID uuid of user who can view the calendar
 * @param rangeBegin date to start searching on (inclusive)
 * @param rangeEnd date to stop searching on (inclusive)
 * @param cb callback that returns the information
 */
function getEvents(db, calendarID, userID, rangeBegin, rangeEnd, cb)
{
    //TODO stub function
    cb("Stub Function", null);
}

/**
 * Edit the selected event
 * @param db initialized database connection
 * @param calendarID calendarID that contains the event
 * @param userID uuid of user that can edit the calendar
 * @param eventID eventID of the event
 * @param newStart new start date of the event
 * @param newEnd new end date of the event
 * @param newName new name of the event
 * @param newDescription new description of the event
 * @param cb callback to return the information
 */
function editEvent(db, calendarID, userID, eventID, newStart, newEnd, newName, newDescription, cb)
{
    //TODO stub function
    cb("Stub Function", null);
}