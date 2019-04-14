/**
 * @file wsComms.js
 * @overview websocket communications
 */

/**
 * @namespace ws
 */
window.ws = window.ws || {};

(function () {
    let self = this;

    self.socket = null;

    $(document).ready(function() {
        self.connect();
    });

    /**
     * Log stuff
     */
    self.log = console.log.bind(console, '[WS]');

    /**
     * Connect the websocket
     * @function connect
     * @memberof ws
     */
    self.connect = function() {
        self.socket = new WebSocket(`ws:${window.location.origin.substr(window.location.protocol.length)}/`);

        self.socket.onopen = function() {
            self.log('Connection ready');
        };

        self.socket.onerror = function(e) {
            self.log('Error!', e);
        };

        self.socket.onclose = function() {
            self.log('Connection closed');
            self.socket = null;
        };

        self.socket.onmessage = function(message) {
            let incoming;
            try {
                incoming = JSON.parse(message.data);
            } catch (e) {
                self.log('Invalid JSON', message.data);
                return;
            }

            self.log('<<', incoming);

            switch (incoming.type) {
                case 'Hello':
                    self.send({
                        type: 'Hello'
                    });
                    break;
                case 'SelfAddCalendar':
                    getOwnCalendars(() => {});
                    break;
                case 'RefreshCalendar':
                    getOwnCalendars(() => {});
                    getEditCalendars(() => {});
                    getViewCalendars(() => {});
                    break;
                case 'DeletedCalendar':
                    getEditCalendars(() => {});
                    getViewCalendars(() => {});
                    break;
                default:
                    self.log.warn(`Unknown message type ${self.connectionID}`, message.data);
                    break;
            }
        };
    };

    /**
     * Send something through the socket
     * @function send
     * @memberof ws
     * @param {*} message - the message to send
     */
    self.send = function(message) {
        self.log('>>', message);
        self.socket.send(JSON.stringify(message));
    };
}).apply(window.ws);
