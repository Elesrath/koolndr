## Koolndur
### Running
To start the server, run
```bash
$ npm start
```

### Basic workflow
Requests are matched against all the routes in the `routes` folder. When the route matches, it will execute the handler. Requests to `/css`, `/js`, or `/images` are served from `/static`.
