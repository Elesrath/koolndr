/**
 * Websocket communications
 */

const uuid = require('uuid/v4');

const calendar = require(`${__rootname}/models/calendar.js`);
const log = require(`${__rootname}/utils/log.js`);


/**
 * Connection logic for a client
 * @class Connection
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {WebSocket} ws - the request
 * @param {OutgoingMessage} req - the original socket request
 */
function Connection(app, ws, res) {
    let self = this;
    self.app = app;
    self.socket = ws;
    self.res = res;
    self.user = res.locals.user;
    self.connectionID = uuid();
    log.debug(`New client socket for user: ${res.locals.user.username} - ${self.connectionID}`);

    self.socket.on('message', function(message) {
        let incoming;
        try {
            incoming = JSON.parse(message);
        } catch (e) {
            log.warn(`Invalid JSON in socket ${self.connectionID}`, message);
            return;
        }

        log.debug(`[<<${self.connectionID}] ${message}`);

        switch (incoming.type) {
            case 'Hello':
                break;
            default:
                log.warn(`Unknown message type ${self.connectionID}`, message);
                break;
        }
    });

    self.socket.on('close', function() {
        log.debug('Client has gone away');

        for (let i = 0; i < self.app.locals.clients.length; i++) {
            if (self.app.locals.clients[i].connectionID === self.connectionID) {
                self.app.locals.clients.splice(i, 1);
                return;
            }
        }

        log.warn(`Could not remove client reference ${self.connectionID}`);
    });

    /**
     * Send a message to the client
     * @memberof utils.ws.Connection
     * @function send
     * @param {*} message - an object to be sent (will first be serialized with JSON.stringify)
     */
    self.send = function(message) {
        message = JSON.stringify(message);
        log.debug(`[>>${self.connectionID}] ${message}`);
        self.socket.send(message);
    };

    /**
     * Broadcast a message to every client except this one
     * @memberof utils.ws.Connection
     * @function broadcast
     * @param {*} message - an object to be sent
     */
    self.broadcast = function(message) {
        for (let connection of self.app.locals.clients) {
            if (connection.connectionID !== self.connection.connectionID) {
                connection.send(message);
            }
        }
    };

    self.send({
        type: 'Hello'
    });
}

 /**
  * Handle a WS connection
  * @function handleWs
  * @memberof utils.ws
  * @param {WebSocket} ws - the request
  * @param {OutgoingMessage} req - the original socket request
  */
function handleWs(ws, res) {
    let app = this;

    app.locals.clients.push(new Connection(app, ws, res.res));
}

/**
 * Propogate the event where a user adds a calendar
 * @function userAddedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} userID - the id of the user that added the calendar
 */
function userAddedCalendar(app, userID) {
    for (let client of app.locals.clients) {
        if (client.user.id === userID) {
            client.send({
                type: 'SelfAddCalendar'
            });
        }
    }
}

/**
 * Propogate the event where a user edits a calendar
 * @function userEditedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} initiatingUser - the id of the user that edited the calendar
 * @param {string} calendarID - the id of the calendar
 */
function userEditedCalendar(app, initiatingUser, calendarID) {
    calendar.getViewersAndEditors(app.locals.db, calendarID, (err, users) => {
        if (err) {
            log.warn(err);
            return;
        }

        for (let client of app.locals.clients) {
            if (client.user.id !== initiatingUser && users.indexOf(client.user.id) !== -1) {
                client.send({
                    type: 'RefreshCalendar',
                    calendarID: calendarID
                });
            }
        }
    });
}

/**
 * Propogate the event where a user deletes a calendar
 * @function userDeletedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} initiatingUser - the id of the user that deleted the calendar
 * @param {string} calendarID - the id of the calendar
 */
function userDeletedCalendar(app, initiatingUser, users, calendarID) {
    for (let client of app.locals.clients) {
        if (client.user.id !== initiatingUser && users.indexOf(client.user.id) !== -1) {
            client.send({
                type: 'DeletedCalendar',
                calendarID: calendarID
            });
        }
    }
}

/**
 * Propogate the event where a user allows another user to edit
 * @function userEditedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} calendarID - the id of the calendar
 * @param {string} userID - the id of the user that can now edit
 */
function allowCalendarEdit(app, calendarID, userID) {
    for (let client of app.locals.clients) {
        if (client.user.id === userID) {
            client.send({
                type: 'AddedPermission',
                calendar: calendarID
            });
        }
    }
}

/**
 * Propogate the event where a user allows another user to view
 * @function userEditedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} calendarID - the id of the calendar
 * @param {string} userID - the id of the user that can now view
 */
function allowCalendarView(app, calendarID, userID) {
    for (let client of app.locals.clients) {
        if (client.user.id === userID) {
            client.send({
                type: 'AddedPermission',
                calendar: calendarID
            });
        }
    }
}

/**
 * Propogate the event where a user disallows another user to edit and view
 * @function userEditedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} calendarID - the id of the calendar
 * @param {string} userID - the id of the user that can no longer edit
 */
function revokePerms(app, calendarID, userID) {
    for (let client of app.locals.clients) {
        if (client.user.id === userID) {
            client.send({
                type: 'RevokedPermission',
                calendar: calendarID
            });
        }
    }
}

/**
 * Propogate the event where a user adds an event
 * @function userEditedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} initiatingUser - the id of the user that added the event
 * @param {string} calendarID - the id of the calendar the event belongs to
 */
function userAddedEvent(app, initiatingUser, calendarID) {
    for (let client of app.locals.clients) {
        if (client.user.id !== initiatingUser) {
            client.send({
                type: 'AddedEvent',
                calendar: calendarID
            });
        }
    }
}

/**
 * Propogate the event where a user edits an event
 * @function userEditedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} initiatingUser - the id of the user that edited the event
 * @param {string} calendarID - the id of the calendar the event belongs to
 */
function userEditedEvent(app, initiatingUser, calendarID) {
    for (let client of app.locals.clients) {
        if (client.user.id !== initiatingUser) {
            client.send({
                type: 'EditedEvent',
                calendar: calendarID
            });
        }
    }
}

/**
 * Propogate the event where a user deletes an event
 * @function userEditedCalendar
 * @memberof utils.ws
 * @param {ExpressApp} app - the express app
 * @param {string} initiatingUser - the id of the user that deleted the event
 * @param {string} calendarID - the id of the calendar the event belonged to
 */
function userDeletedEvent(app, initiatingUser, calendarID) {
    for (let client of app.locals.clients) {
        if (client.user.id !== initiatingUser) {
            client.send({
                type: 'DeletedEvent',
                calendar: calendarID
            });
        }
    }
}


/**
 * @namespace utils.ws
 */
module.exports = {
    handleWs: handleWs,
    userAddedCalendar: userAddedCalendar,
    userEditedCalendar: userEditedCalendar,
    userDeletedCalendar: userDeletedCalendar,
    allowCalendarEdit: allowCalendarEdit,
    allowCalendarView: allowCalendarView,
    revokePerms: revokePerms,
    userAddedEvent: userAddedEvent,
    userEditedEvent: userEditedEvent,
    userDeletedEvent: userDeletedEvent
};
