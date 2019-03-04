#!/usr/bin/env node

/**
 * Application entry point.
 * @usage $ ./app.js
 */

// __rootname will be the root directory of this project. Other files can reference this variable to get relative
// file paths from the root of the project instead of from each file.
global.__rootname = __dirname;

const conf = require(`${__rootname}/conf.json`);
const log = require(`${__rootname}/utils/log.js`);


function main() {
    log.info('Starting Koolndur!');
}

// start it up!
main();
