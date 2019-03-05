## Koolndur
### Running
To start the server, run
```bash
$ npm start
```
As first-time setup, you'll need to add a `credentials.json` file with the following contents:
```json
{
    "db": "db-user-password"
}
```

### Basic workflow
Requests are matched against all the routes in the `routes` folder. When the route matches, it will execute the handler. Requests to `/css`, `/js`, or `/images` are served from `/static`.

### Deploying changes
To deploy a change,
```bash
$ ssh seng511@138.197.170.220 './deploy.sh'
```
You will be presented with the output of `app.js` until you `CTRL-C`. The app will still be running when you do this. If a fatal crash occurs, the app will be automatically restarted with `forever`.

