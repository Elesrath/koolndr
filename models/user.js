/**
 * User data
 */

const log = require(`${__rootname}/utils/log.js`);

/**
 * Holds information and methods relating to users
 * @class User
 * @memberof models.user
 * @param {WrappedDBConnection} db - the connected database
 */
function User(db)
{
    // capture context
    let self = this;

    self.db = db;

    // serializable data
    self.id = null;
    self.username = null;
    self.email = null;

    /**
     * Initialize data
     * @function init
     * @memberof models.user.User
     * @param {string} id - the uuid of the user to grab data for
     * @callback cb - a callback taking (err, success)
     */
    self.init = function (id, cb)
    {
        self.db.query(`
            SELECT uuid,
                username,
                email
            FROM users
            WHERE uuid = ?
            LIMIT 1;`, [
            id
        ], (err, row) =>
        {
            if (err)
            {
                cb(err);
                return;
            }

            if (row)
            {
                self.id = row[0].uuid;
                self.username = row[0].username;
                self.email = row[0].email;
                cb(null, true);
            }
            else
            {
                cb(null, false);
            }
        });
    };

    /**
     * Serialize data into a JSON string
     * @function toJSON
     * @memberof models.user.User
     * @returns {string} the JSON representation of this user
     */
    self.toJSON = function ()
    {
        return JSON.stringify({
            id: self.id,
            username: self.username,
            email: self.email
        });
    }
}

/**
 * Get a user by id
 * @function getUserById
 * @memberof models.user
 * @param {WrappedDBConnection} db - the connected database
 * @param {string} id - the user id
 * @callback cb - a callback taking (user)
 */
function getUserById(db, id, cb)
{
    let user = new User(db);
    user.init(id, (err, ok) =>
    {
        if (err)
        {
            log.error(err);
            cb(null);
        }
        else if (!ok)
        {
            log.warn('GetUserById could not find the user');
            cb(null);
        }
        else
        {
            cb(user);
        }
    });
}

/**
 * @namespace models.user
 */
module.exports = {
    User: User,
    getUserById: getUserById
};
