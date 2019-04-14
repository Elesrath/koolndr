/**
 * Authentication logic
 */

const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');

const conf = require(`${__rootname}/conf.json`);
const log = require(`${__rootname}/utils/log.js`);


/**
 * Validate that a user exists and authenticate them.
 * @function authenticate
 * @memberof utils.authentication
 * @param {WrappedDBConnection} db - the connected database
 * @param {string} username - the username of the user to test
 * @param {string} password - the plaintext password of the user to test
 * @callback cb - a callback taking (err, user.uuid, user.username). If the credentials are not correct, uuid and
 * username will be null
 */
function authenticate(db, username, password, cb) {
    if (!username || !password) {
        log.debug('No username or password provided. Aborting');
        cb(null, null, null);
        return;
    }

    db.query('SELECT uuid, username, password FROM users WHERE username = ?;', [
        username
    ], (err, row) => {
        if (err) {
            cb(err, null, null);
            return;
        }

        if (row.length === 0) {
            // user does not exist
            log.debug('User does not exist');
            cb(null, null, null);
            return;
        }

        bcrypt.compare(password, row[0].password, (err, ok) => {
            if (err) {
                cb(err, null, null);
                return;
            }

            if (!ok) {
                log.debug('User exists but has bad credentials');
                cb(null, null, null);
                return;
            }

            log.debug('User exists and has correct credentials');
            cb(null, row[0].uuid, row[0].username);
            return;
        });
    });
}

/**
 * Create a new user.
 * @note Inputs to this function are expected to be valid!
 * @function createUser
 * @memberof utils.authentication
 * @param {WrappedDBConnection} db - the connected database
 * @param {string} username - the username of the new user
 * @param {string} password - the password of the new user
 * @param {string} email - the email of the new user
 * @callback cb - a callback taking (err, user.uuid, user.username)
 */
function createUser(db, username, password, email, cb) {
    bcrypt.genSalt(conf.encryption.rounds, (err, salt) => {
        if (err) {
            cb(err);
            return;
        }

        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                cb(err);
                return;
            }

            let id = uuid(); //UserType: 0 = non-premium, 1 = premium
            db.query('INSERT INTO users (uuid, username, password, email, userType) VALUES (?, ?, ?, ?, ?);', [
                id,
                username.toLowerCase(),
                hash,
                email,
                0
            ], (err) => {
                if (err) {
                    cb(err);
                    return;
                }

                log.info(`Created new user "${username}" authenticated by ${hash}`);
                cb(null, id, username.toLowerCase());
            });
        });
    });
}

/**
 * Create a session
 * @function createSession
 * @memberof utils.authentication
 * @param {WrappedDBConnection} db - the connected database
 * @param {string} userID - the user to create the session for
 * @callback cb - a callback taking (err, sessionToken)
 */
function createSession(db, userID, cb) {
    pruneSessions(db);
    let session = uuid();
    log.info(`Creating session for ${userID}: ${session}`);

    db.query('INSERT INTO sessioncookie (user, token, issued) VALUES (?, ?, ?);', [
        userID, session, Math.floor(Date.now() / 1000)
    ], (err) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null, session);
    });
}

/**
 * Check that a session token is valid
 * @function checkSession
 * @memberof utils.authentication
 * @param {WrappedDBConnection} db - the connected database
 * @param {string} session - the session token to check
 * @callback cb - a callback that takes (err, uuid)
 */
function checkSession(db, session, cb) {
    pruneSessions(db);
    db.query(`
        SELECT users.uuid AS uuid
        FROM sessioncookie INNER JOIN users ON sessioncookie.user = users.uuid
        WHERE sessioncookie.token = ?
            AND sessioncookie.issued > ?
        LIMIT 1;
    `, [
        session,
        Math.floor(Date.now() / 1000) - conf.sessionLength
    ], (err, rows) => {
        if (err) {
            cb(err);
            return;
        }
        if (rows.length) {
            cb(null, rows[0].uuid);
            return;
        }
        cb(null, null);
    });
}

/**
 * Delete all expired sessions
 * @function pruneSessions
 * @memberof utils.authentication
 * @param {WrappedDBConnection} db - the connected database
 * @callback [cb] - an optional callback taking (err).
 */
function pruneSessions(db, cb) {
    db.query('DELETE FROM sessioncookie WHERE sessioncookie.issued < ?;', [
        Math.floor(Date.now() / 1000) - conf.sessionLength
    ], (err) => {
        if (err) {
            if (cb) {
                cb(err);
                return;
            }
            log.error(err);
        }

        if (cb) {
            cb();
        }
    });
}

/**
 * Delete a session
 * @function deleteSession
 * @memberof utils.authentication
 * @param {WrappedDBConnection} db - the connected database
 * @param {string} session - the session to delete
 * @callback [cb] - an optional callback taking (err)
 */
function deleteSession(db, session, cb) {
    db.query('DELETE FROM sessioncookie WHERE token = ?;', [session], (err) => {
        if (err) {
            if (cb) {
                cb(err);
                return;
            }
            log.error(err);
        }

        if (cb) {
            cb();
        }
    });
}

/**
 * @namespace utils.authentication
 */
module.exports = {
    authenticate: authenticate,
    createUser: createUser,
    createSession: createSession,
    checkSession: checkSession,
    pruneSessions: pruneSessions,
    deleteSession: deleteSession
};
