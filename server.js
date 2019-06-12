// server.js
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./app/routes');
const app = express();
var compression = require('compression');

const port = process.env.PORT || 8000;

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./'));

routes(app);
app.listen(port, () => {
    console.log('We are live on ' + port);
});