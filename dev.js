

const fs = require('fs');
const express = require('express');
var cluster = require('cluster');
var sticky = require('sticky-session');

var redisPort = 6375;
var redisHost = '127.0.0.1';
var maxSaveLimit = 30;
var isDebug = true;
isDebug = false;


var http = require('http');
const app = express();
var server = http.createServer(app);

if (!sticky.listen(server, 3000)) {
	// Master code
	server.once('listening', function() {
	  console.log('server started on 3000 port');
	});
} else {	
	console.log('worker', cluster.worker.id)
	// Worker code
	app.use('/static', express.static(__dirname + '/static'));
	app.get("/", (req, res) => {
		let path = __dirname + '/static/index.html';
		res.sendFile(path);
    });
    
    const io = require('socket.io').listen(server);
}
