#!/usr/bin/env node

/**
 * Application entry point.
 * @usage $ ./app.js
 */

// __rootname will be the root directory of this project. Other files can reference this variable to get relative
// file paths from the root of the project instead of from each file.
global.__rootname = __dirname;

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const conf = require(`${__rootname}/conf.json`);
const log = require(`${__rootname}/utils/log.js`);
const route = require(`${__rootname}/utils/route.js`);
const db = require(`${__rootname}/utils/db.js`);

const calendar = require(`${__rootname}/models/calendar.js`);

function main()
{
    log.info('Starting Koolndur!');
    let app = express();

    // express configuration
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    app.set('case sensitive routing', false);
    app.set('strict routing', false);
    app.set('views', `${__rootname}/views`);
    app.set('view engine', 'ejs');

    // load all express routes
    log.info('Loading routes...');
    let routes = route.load(app);

    // set up db
    log.info('Connecting to database...');
    db.getDB((err, dbConnection) =>
    {
        if (err)
        {
            log.fatal(err);
            return;
        }

        app.locals.db = dbConnection;
        log.info('Connected');

        log.info(`Setup complete. Listening on ${conf.port}`);
        app.listen(conf.port);

        //TODO remove me once my purpose as an example is no more :(
        //Test of AddCalendar
        calendar.addCalendar(app.locals.db, "TestyMcTestFace", "123", (err, success) =>
        {
            if(err)
            {
                log.debug("An error occurred in test call of addCalendar");
                log.debug(err);
            }
            if(success)
            {
                log.debug("Add Calendar called successfully");
            }
            else
            {
                log.debug("Add Calendar failed");
            }
        });
    });
}

// start it up!
main();
