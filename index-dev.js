const express = require('express');
const http = require('http');

const app = express();
const server = http.Server(app);

app.use('/', express.static(__dirname + '/client'));
app.get('/lib/phaser.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/phaser/build/phaser.js');
});
app.get('/lib/phaser-input.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/@orange-games/phaser-input/build/phaser-input.js');
});
app.get('/lib/phaser-nineslice.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/@orange-games/phaser-nineslice/build/phaser-nineslice.js');
});

const port = process.env.PORT || 3000;
server.listen(port);
console.info("Server started on port " + port);