const express = require('express');
const http = require('http');

const app = express();
const server = http.Server(app);

app.use('/', express.static(__dirname + '/dev_build'));

const port = process.env.PORT || 3000;
server.listen(port);
console.info("Server started on port " + port);