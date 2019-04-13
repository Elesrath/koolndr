/**
 * Websocket routes
 * @file _02_websocket.js
 */

const ws = require(`${__rootname}/utils/ws.js`);

module.exports = {
    load: function(app) {
        app.locals.clients = [];
        app.ws('/', ws.handleWs.bind(app));
    }
};
