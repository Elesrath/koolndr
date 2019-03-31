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

//TODO remove these once testing is finished
const calendar = require(`${__rootname}/models/calendar.js`);
const events = require(`${__rootname}/models/events.js`);
const auth = require(`${__rootname}/utils/authentication.js`);


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
        //Adds some test stuff to the database. Make sure you reset your database via schema.sql, as
        //This probably wont work otherwise!!!
        auth.createUser(app.locals.db, "Isabel", "password", "testy@example.com", (err, id, uname) =>
        {
            if(err)
            {
                log.debug(err);
            }
            else
            {
                let testUserID = id;
                let testUserName = uname;
                calendar.addCalendar(app.locals.db, "New test calendar", testUserID, (err) =>
                {
                    if(err)
                    {
                        log.debug("An error occurred in test call of addCalendar");
                        log.debug(err);
                    }
                    else
                    {
                        log.debug("Add Calendar called successfully");
                        events.addEvent(app.locals.db, 2, testUserID, "Test Event", "2019-04-12 10:42:42", "2019-04-12 12:42:42", "Blah Blah Blah event description", (err) =>
                        {
                            if(err)
                            {
                                log.debug(err);
                            }
                            else
                            {
                                log.debug("Event Added Successfully");
                                events.getEvents(app.locals.db, 2, testUserID, "2019-04-12 10:42:30", "2019-04-12 13:00:00", (err, result) =>
                                {
                                    if(err)
                                    {
                                        log.debug(err);
                                    }
                                    else
                                    {
                                        log.debug(result[0]);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });



    });
}

// start it up!
main();
