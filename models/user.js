/**
 * User data
 */

const bcrypt = require('bcrypt');

const conf = require(`${__rootname}/conf.json`);
const log = require(`${__rootname}/utils/log.js`);

/**
 * Holds information and methods relating to users
 * @class User
 * @memberof models.user
 * @param db - the connected database
 */

//UserType: 0 = non-premium, 1 = premium
function User(db)
{
    // capture context
    let self = this;

    self.db = db;

    // serializable data
    self.id = null;
    self.username = null;
    self.email = null;
    self.userType = null;

    /**
     * Initialize data
     * @function init
     * @memberof models.user.User
     * @param {string} id - the uuid of the user to grab data for
     * @param cb - a callback taking (err, success)
     */
    self.init = function (id, cb)
    {
        self.db.query(`SELECT uuid, username, email, userType FROM users WHERE uuid = ? LIMIT 1;`, [id], (err, row) =>
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
                self.userType = row[0].userType;
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
            email: self.email,
            userType: self.userType
        });
    }
}

/**
 * Get a user by id
 * @function getUserById
 * @memberof models.user
 * @param db - the connected database
 * @param {string} id - the user id
 * @param cb - a callback taking (user)
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
 * Change user to type (premium or ordinary)
 * @param db initialized database connection
 * @param userID user to update
 * @param newType new type of user; 0 for ordinary, or 1 for premium
 * @param cb callback
 */
function changeUserType(db, userID, newType, cb)
{
    log.debug("Changing user " + userID + " to type " + newType);
    db.query(`UPDATE users SET userType = ? WHERE uuid = ?`, [newType, userID], (err) =>
    {
        if (err)
        {
            cb(err.sqlMessage);
        }
        else
        {
            cb(null);
        }
    });
}

/**
 * Update the information of the user
 * @param db initialized database connection
 * @param userID id of user to update
 * @param newName new username
 * @param newPassword new password
 * @param newEmail new email
 * @param cb callback
 */
function updateUserInfo(db, userID, newName, newPassword, newEmail, cb)
{
    bcrypt.genSalt(conf.encryption.rounds, (err, salt) => {
        if (err) {
            cb(err);
            return;
        }

        bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) {
                cb(err);
                return;
            }


            db.query(
                `UPDATE users
                SET username = ?, password = ?, email = ?
                WHERE uuid = ?`,
                [newName.toLowerCase(), hash, newEmail, userID], (err) =>
                {
                    if (err)
                    {
                        cb(err.sqlMessage);
                    }
                    else
                    {
                        cb(null);
                    }
                }
            );
        });
    });    
}

/**
 * Get users based on search term
 * @param db initialized database connection
 * @param userID
 * @param searchTerm
 * @param cb callback
 */
function searchUsers(db, userID, searchTerm, cb)
{
    log.debug("Searching users containing" + searchTerm);
    searchTerm = '%' + searchTerm + '%';
    db.query(`SELECT uuid, username FROM users WHERE username LIKE ? AND uuid != ?`, [searchTerm, userID], (err, result) =>
    {
        if (err)
        {
            cb(err.sqlMessage, null);
        }
        else if (!result[0]) //No results
        {
            cb(null, null);
        }
        else
        {
            cb(null, result);
        }
    });
}

/**
 * @namespace models.user
 */
module.exports = {
    User: User,
    getUserById: getUserById,
    changeUserType: changeUserType,
    searchUsers: searchUsers,
    updateUserInfo: updateUserInfo
};
