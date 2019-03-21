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
 * @namespace models.calendar
 */
module.exports = {
    addCalendar: addCalendar,
};