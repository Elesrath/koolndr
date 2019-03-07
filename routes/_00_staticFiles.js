/**
 * Routes for serving static (css, js, img, etc) files
 * @note: this is 00 because it needs to be loaded BEFORE the _01_authentication routes
 */

const express = require('express');
const fs = require('fs');
const sass = require('node-sass');

const log = require(`${__rootname}/utils/log.js`);
const conf = require(`${__rootname}/conf.json`);


let sassCache = {};

module.exports = {
    load: function(app) {
        // serve all static stuff with the built in logic
        app.use(express.static(conf.staticPath));

        // check for .css requests on a .sass file
        app.get('*.css', (req, res, next) => {
            let sassFile = req._parsedUrl.pathname.replace(/\.css$/, '.sass');
            log.debug(`Searching for SASS file: ${sassFile}`);

            if (sassCache.hasOwnProperty(`${__rootname}/${conf.staticPath}/${sassFile}`)) {
                log.debug('Found in SASS cache');
                res.setHeader('content-type', 'text/css');
                res.send(sassCache[`${__rootname}/${conf.staticPath}/${sassFile}`]);
                next();
                return;
            }

            fs.stat(`${__rootname}/${conf.staticPath}/${sassFile}`, (err, stat) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // file not found
                        log.debug('Could not find SASS file');
                        next();
                        return;
                    }

                    // other error
                    log.error(err);
                    next();
                    return;
                }

                log.debug('Rendering to cache...');
                sass.render({
                    file: `${__rootname}/${conf.staticPath}/${sassFile}`,
                    includePaths: [`${__rootname}/${conf.staticPath}/css`],
                    indentWidth: 4,
                    outputStyle: 'expanded'
                }, (err, result) => {
                    if (err) {
                        log.error(err);
                        next();
                        return;
                    }

                    sassCache[`${__rootname}/${conf.staticPath}/${sassFile}`] = result.css.toString();

                    res.setHeader('content-type', 'text/css');
                    res.send(result.css.toString());
                    next();
                });
            });
        });
    }
}
