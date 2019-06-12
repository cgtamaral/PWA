var path = require('path');

module.exports = function (app) {
    //GET
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '../..', '/index.html'));
    });
};