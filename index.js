const express = require('express');
const http = require('http');

const app = express();
const server = http.Server(app);

app.use('/', express.static(__dirname + '/client'));
app.get('/lib/phaser.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/phaser/build/phaser.js');
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log("Server started on port " + port);