/**
 * Discover and execute route files
 */

const fs = require('fs');

const conf = require(`${__rootname}/conf.json`);
const log = require(`${__rootname}/utils/log.js`);


/**
 * Look through the routes directory and execute the files in them
 * @function loadRoutes
 * @memberof utils.route
 * @param {express.app} app - the express app
 * @returns {[*]} an array of the routes that got loaded
 */
function loadRoutes(app) {
    let startingPath = `${__rootname}/${conf.routePath}`;
    let routes = [];
    log.debug(`Starting route search in ${startingPath}`);

    (function descend(path) {
        let dir = fs.readdirSync(path, {withFileTypes: true});
        for (let file of dir) {
            if (file.isDirectory()) {
                descend(`${path}/${file.name}`);
            } else if (file.isFile()) {
                if (/\.js$/.test(file.name)) {
                    log.debug(`Executing route: ${path}/${file.name}`);
                    try {
                        let route = require(`${path}/${file.name}`);
                        route.load(app);
                        routes.push(route);
                    } catch(e) {
                        log.error(`Failed to load route: ${path}/${file.name}`, e);
                    }
                } else {
                    log.debug(`Non-js file in route dir: ${file.name}`);
                }
            }
        }
    })(startingPath);

    log.debug(`Loaded ${routes.length} routes`);

    return routes;
}

/**
 * @namespace utils.route
 */
module.exports = {
    load: loadRoutes
};
