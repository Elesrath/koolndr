/**
 * Websocket communications
 */

const uuid = require('uuid/v4');

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
 * @namespace utils.ws
 */
module.exports = {
    handleWs: handleWs
};
