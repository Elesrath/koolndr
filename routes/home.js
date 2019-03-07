/**
 * Home page routes
 */


 /**
  * Handle a GET to the login page
  * @function handleLoginPage
  * @memberof routes.login
  * @param {IncomingMessage} req - the request
  * @param {OutgoingMessage} res - the response
  * @param {function} next - the next routing handler
  */
function handleHomePage(req, res, next) {
    res.render('home', {
        app: this,
        req: req
    });
}

/**
 * Load the routes in this file
 * @function load
 * @memberof routes.login
 * @param {ExpressApp} app - the express app
 */
function load(app) {
    app.get('/home', handleHomePage.bind(app));
    app.get('/', handleHomePage.bind(app));
}

/**
 * @namespace routes.home
 */
module.exports = {
    load: load,
    handleHomePage: handleHomePage
};
