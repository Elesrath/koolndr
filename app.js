#!/usr/bin/env node

/**
 * Application entry point.
 * @usage $ ./app.js
 */

// __rootname will be the root directory of this project. Other files can reference this variable to get relative
// file paths from the root of the project instead of from each file.
global.__rootname = __dirname;

const express = require('express');

const conf = require(`${__rootname}/conf.json`);
const log = require(`${__rootname}/utils/log.js`);
const route = require(`${__rootname}/utils/route.js`);
const db = require(`${__rootname}/utils/db.js`);

function main() {
    log.info('Starting Koolndur!');
    let app = express();

    // express configuration
    app.set('case sensitive routing', false);
    app.set('strict routing', false);
    app.set('views', `${__rootname}/views`);
    app.set('view engine', 'ejs');

    // load all express routes
    log.info('Loading routes...');
    let routes = route.load(app);

    // set up db
    log.info('Connecting to database...');
    db.getDB((err, dbConnection) => {
        if (err) {
            log.fatal(err);
            return;
        }

        app.locals.db = dbConnection;
        log.info('Connected');

        log.info(`Setup complete. Listening on ${conf.port}`);
        app.listen(conf.port);
    });
}

// start it up!
main();
