/*
    PlayCanvas Physics headless nodejs server

    Information: To create a simple playcanvas headless server nodejs.

    Notes:
     * ammo.js loading more modules might crashes or fail to load correctly.

*/

//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var _http = require('http');
var path = require('path');
var fs = require('fs');
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var engine = require('engine.io');
var engineio = new engine.Server({'transports': ['websocket', 'polling']});

// 0 = socket.io
// 1 = engine.io
OBJIONetworkType = 0;
//
bConfigPlayCanvas = true;

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = _http.createServer(router);
engineio.attach(server);
var io = socketio.listen(server);

//router.use(function(req, res, next){
    //res.header("Content-Security-Policy", "default-src 'self';script-src 'self';object-src 'none';img-src 'self';media-src 'self';frame-src 'none';font-src 'self' data:;connect-src 'self';style-src 'self'");
    //next();
//});

//client folder for public access for host web broswer files
router.use(express.static(path.resolve(__dirname, 'client')));
//load file to write url file js
var eio_contents = fs.readFileSync(__dirname + '/node_modules/engine.io-client/engine.io.js').toString();
router.get('/engine.io.js', function(req, res) {
	//res.setHeader("Access-Control-Allow-Origin", "*");
	res.send(eio_contents);
});
//=========================================================
// socket.io
//=========================================================
var messages = [];
var sockets = [];
io.set('log level', 1); // reduce logging
io.on('connection', function (socket) {
	console.log("socket.io user connected!");
    messages.forEach(function (data) {
		socket.emit('message', data);
    });
    sockets.push(socket);
    socket.on('disconnect', function () {
		sockets.splice(sockets.indexOf(socket), 1);
		updateRoster();
		console.log("socket.io user disconnect!");
    });
    socket.on('message', function (msg) {
		var text = String(msg || '');
		if (!text)
			return;
		socket.get('name', function (err, name) {
			var data = {
				name: name,
				text: text
			};
			broadcast('message', data);
			messages.push(data);
		});
	});

    socket.on('identify', function (name) {
		socket.set('name', String(name || 'Anonymous'), function (err) {
			updateRoster();
		});
	});
});

function updateRoster() {
	async.map(
		sockets,
		function (socket, callback) {
			socket.get('name', callback);
		},
		function (err, names) {
			broadcast('roster', names);
		}
	);
}

function broadcast(event, data) {
	sockets.forEach(function (socket) {
		socket.emit(event, data);
	});
}

//=========================================================
// engine.io
//=========================================================

var engineios =[];
//console.log(engineio);
engineio.on('connection', function (socket) {
    //console.log(engineio);
    //console.log(engineio.clients);
    //for(eid in engineio.clients) {
        //console.log(engineio.clients[eid]);
        //engineio.clients[eid].send('test');
        //console.log(variable);
    //}
    //console.log(socket);
    console.log("engine.io user connected.");
    socket.send('ping');
    //socket.send("{test:'test'}"); //send out as string
    socket.on('message', function(data){
        console.log(data);
    });
    socket.on('close', function(){
        console.log("engine.io user close.");
    });
    //socket.send('utf 8 string');
    //socket.send(new Buffer([0, 1, 2, 3, 4, 5])); // binary data
    //console.log(new Buffer([0, 1, 2, 3, 4, 5]));
    //socket.send(new test()); // binary data
});

//create send clients
function engineiobroadcast(data){
    for(eid in engineio.clients) {
        //console.log(engineio.clients[eid]);
        engineio.clients[eid].send(data);
    }
}

//=========================================================
// start listen express server
//=========================================================

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
	var addr = server.address();
	//try{
	//setTimeout(function(){
		var pce = require('./playcanvas-engine.js');
		pce.socketio_boardcast(broadcast);
		pce.engineio_boardcast(engineiobroadcast);
	//}, 3000);

	//}catch(e){
		//console.log("playcanvas-engine?");
		//console.log(e);
	//}
	console.log("PlayCanvas server listening at", addr.address + ":" + addr.port);
});
