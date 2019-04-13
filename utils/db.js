/**
 * Utilities for accessing the database
 */

const mysql = require('mysql');

const conf = require(`${__rootname}/conf.json`);
const credentials = require(`${__rootname}/credentials.json`);
const log = require(`${__rootname}/utils/log.js`);


let connection;

// it's better to fully wrap the db connection so as to allow us to switch
// databases or change functionality in the future
/**
 * Get a database connection
 * @function getDB
 * @memberof utils.db
 * @param {function} cb- callback that takes err and the wrapped db connection
 * @returns {WrappedDBConnection}
 */
function getDB(cb)
{
    if (typeof connection === 'undefined')
    {
        let options = {
            user: conf.db.user,
            password: credentials.db,
            database: conf.db.database,
            socketPath: conf.db.socket
        };

        log.debug('Connecting to DB with options: ', options);

        connection = {
            _internalConnection: mysql.createConnection(options)
        };

        connection.query = function (query, esc, callback)
        {
            let start = Date.now();

            // if there is no escaped values and a callback was passed
            if (typeof esc === 'function')
            {
                callback = esc;
                esc = [];
            }

            connection._internalConnection.query(query, esc, (err, rows) =>
            {
                log.db(`Query time: ${Date.now() - start}ms`, `Query: ${query}`, esc);
                callback(err, rows);
            });
        };

        connection.format = mysql.format;

        // connect to the db
        connection._internalConnection.connect((err) =>
        {
            if (err)
            {
                cb(err);
                return;
            }

            if (connection._internalConnection.state !== 'authenticated')
            {
                cb(new Error(`Invalid connection state: ${connection._internalConnection.state}`));
                return;
            }

            cb(null, connection);
        });
    }
    else
    {
        cb(null, connection);
        return;
    }
}

/**
 * @namespace utils.db
 */
module.exports = {
    getDB: getDB
};
