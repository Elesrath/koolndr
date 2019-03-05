/**
 * Log things to stdout in a common place
 */

const util = require('util');

const conf = require(`${__rootname}/conf.json`);


/**
 * Print messages with a prefix
 * @function printWithPrefix
 * @private
 * @param {stream} stream - the stream to "print" to
 * @param {string} prefix - the prefix to put before each line
 * @param {...string} messages - the actual messages to print. If a message is not a string, it will be converted via
 * util.inspect. Each message will be placed on it's own line
 */
function printWithPrefix(stream, prefix, ...messages) {
    let payload = '';

    for (let message of messages) {
        if (typeof message !== 'string') {
            message = util.inspect(message, false, null);
        }
        for (let line of message.split('\n')) {
            payload += `${prefix}${line}\n`;
        }
    }

    stream.write(payload);
};

/**
 * Log debug messages
 * @function logToDebug
 * @memberof utils.log
 * @param {...string} [messages] - the message(s) to log
 */
function logToDebug(...messages) {
    if (conf.log.debug && messages.length) {
        printWithPrefix(process.stdout, '\x1b[34m[DEBUG] \x1b[0m', ...messages);
    }
}

/**
 * Log info messages
 * @function logToInfo
 * @memberof utils.log
 * @param {...string} [messages] - the message(s) to log
 */
function logToInfo(...messages) {
    if (conf.log.info && messages.length) {
        printWithPrefix(process.stdout, '\x1b[35m[ INF ] \x1b[0m', ...messages);
    }
}

/**
 * Log warning messages
 * @function logToWarn
 * @memberof utils.log
 * @param {...string} [messages] - the message(s) to log
 */
function logToWarn(...messages) {
    if (conf.log.warn && messages.length) {
        printWithPrefix(process.stderr, '\x1b[33m[ WRN ] \x1b[0m', ...messages);
    }
}

/**
 * Log error messages
 * @function logToError
 * @memberof utils.log
 * @param {...string} [messages] - the message(s) to log
 */
function logToError(...messages) {
    if (conf.log.error && messages.length) {
        printWithPrefix(process.stderr, '\x1b[31m[ ERR ] \x1b[0m', ...messages);
    }
}

/**
 * Log fatal messages
 * @function logToFatal
 * @memberof utils.log
 * @param {...string} [messages] - the message(s) to log
 */
function logToFatal(...messages) {
    printWithPrefix(process.stderr, '\x1b[31m[FATAL] \x1b[0m', ...messages);
}

/**
 * Log db messages
 * @function logToDB
 * @memberof utils.log
 * @param {...string} [messages] - the message(s) to log
 */
function logToDB(...messages) {
    if (conf.log.db && messages.length) {
        printWithPrefix(process.stdout, '\x1b[34m[DBASE] \x1b[0m', ...messages);
    }
}

/**
 * @namespace utils.log
 */
module.exports = {
    debug: logToDebug,
    info: logToInfo,
    warn: logToWarn,
    error: logToError,
    fatal: logToFatal,
    db: logToDB
};
