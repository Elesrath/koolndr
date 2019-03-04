/**
 * Routes for serving the login/authentication pages
 */


module.exports = {
    load: function(app) {
        app.get('/', (req, res) => {
            res.render('login', {time: Date.now()});
        });
    }
}
