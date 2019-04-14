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
const ews = require('express-ws');

const conf = require(`${__rootname}/conf.json`);
const log = require(`${__rootname}/utils/log.js`);
const route = require(`${__rootname}/utils/route.js`);
const db = require(`${__rootname}/utils/db.js`);


function main()
{
    log.info('Starting Koolndur!');
    let app = express();
    let expressWebsocket = ews(app);

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

        // ws routes have their errors silenced. This has to be the last middleware in the chain
        function errorHandler (err, req, res, next) {
            if(req.ws){
                log.error("ERROR from WS route - ", err);
            } else {
                log.error(err);
                res.setHeader('Content-Type', 'text/plain');
                res.status(500).send(err.stack);
            }
        }
        app.use(errorHandler);

        app.listen(conf.port);
    });
}

// start it up!
main();
