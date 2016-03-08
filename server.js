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
var http = require('http');
var path = require('path');
var fs = require('fs');
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var engine = require('engine.io');
var engineio = new engine.Server({'transports': ['websocket', 'polling']});

// 0 = socket.io
// 1 = engine.io
var OBJIONetworkType = 0;

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
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
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
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
    console.log("engine.io connected.");
    socket.send('ping');
    //socket.send("{test:'test'}"); //send out as string
    socket.on('message', function(data){
        console.log(data);
    });
    socket.on('close', function(){
        console.log("engine.io close.");
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
// Browser variable setup
//=========================================================
var app;
//override or add this variable in here
//global var
Element = {}; //emulate browser variable
Element.prototype={mozRequestFullScreen:false}

navigator = {};//emulate browser variable
navigator.prototype={isCocoonJS:false}

//webgl null function for headless server
var webgl_null = function(){};
//headless null all functions
webgl_null.prototype={
    getParameter:function(){},
    getExtension:function(){},
    disable:function(){},
    blendFunc:function(){},
    blendEquation:function(){},
    colorMask:function(){},
    enable:function(){},
    cullFace:function(){},
    depthMask:function(){},
    clearDepth:function(){},
    clearColor:function(){},
    createBuffer:function(){},
    bindBuffer:function(){},
    bufferData:function(){},
    getError:function(){},
    vertexAttribPointer:function(){},
    deleteBuffer:function(){},
    createShader:function(){},
    shaderSource:function(){},
    compileShader:function(){},
    createProgram:function(){},
    attachShader:function(){},
};
//load web browser variable & functions
//https://github.com/tmpvar/jsdom
/*
var jsdom  = require('jsdom');
jsdom.env({
  html: "<html><body><canvas id='application-canvas'></canvas></body></html>",
  done: function(errs, _window) {
    //global var
    document = _window.document;
    window = _window
    //global.window = _window;
    //console.log(Ammo);
    LoadPlayCanvas();
  }
});
*/
var jsdom = require("jsdom").jsdom;
document = jsdom("<html><body><canvas id='application-canvas'></canvas></body></html>");
window = document.defaultView;
Ammo = require('ammo.js'); //need to be here to since it need window variable
var canvas = window.document.getElementById("application-canvas");
//override function to null webgl for headless functions
canvas.getContext=function(canvas,options){
    //webgl_null functions
    return new webgl_null();
}
//override boolean to run headless else console.log error
window.WebGLRenderingContext = true;
//=========================================================
//set up playcanvas app
//=========================================================
pc = require('./client/playcanvas-latest.js').pc;
//create app
app = new pc.Application(canvas,{});
//wait to load the scene when the ammo.js is finish setup
app.preload(function (err) {
    if (err) {
        console.error(err);
    }
    CreateScene();
});

function CreateScene(){

  app.start();

  // Fill the available space at full resolution
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

  // Utility function to create a material
  function createMaterial(r, g, b) {
    var material = new pc.scene.PhongMaterial();
    material.ambient.set(r, g, b);
    material.diffuse.set(r, g, b);
    material.specular.set(1, 1, 1);
    material.shininess = 50;
    material.update();
    return material;
  }

  // Create camera entity
  function Camera() {
    var cam = new pc.Entity();
    cam.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.1),
      farClip: 20
    });
    app.root.addChild(cam);
    this.entity = cam;
    this.timer = 0;
  }

  Camera.prototype.update = function (dt) {
    this.timer += dt;
    // Spin the camera around a center point
    var x = Math.sin(this.timer * 0.25) * 6;
    var z = Math.cos(this.timer * 0.25) * 4;
    var e = this.entity;
    e.setPosition(x, 5, z);
    e.lookAt(0, 3, 0);
  }

  // Create spot light entity
  function Light() {
    var light = new pc.Entity();
    light.setPosition(10, 10, 10);
    light.setEulerAngles(45, 45, 0);
    light.addComponent('light', {
      type: "spot",
      intensity: 1.5,
      castShadows: true,
      range: 40
    });
    light.light.shadowResolution = 2048;
    light.light.shadowDistance = 8;
    light.light.shadowBias = 0.005;
    light.light.normalOffsetBias = 0.01;
    app.root.addChild(light);
    this.entity = light;
  }

  // Create ground
  function Ground() {
    var ground = new pc.Entity();
    ground.setPosition(0, -0.5, 0);
    ground.setLocalScale(10, 1, 10);

    ground.addComponent('model', {
      type: "box"
    });
    ground.addComponent('rigidbody', {
      type: "static"
    });
    ground.addComponent('collision', {
      type: "box",
      halfExtents: [5, 0.5, 5]
    });
    var blue = createMaterial(0.28, 0.46, 1);
    ground.model.model.meshInstances[0].material = blue;
    app.root.addChild(ground);
    this.entity = ground;
  }
  var blocks;
  // Create wall
  function Wall() {
    var black = createMaterial(0, 0, 0);
    var white = createMaterial(1, 1, 1);

    this.bricks = blocks = [];

    for (var i = 0; i < 25; i++) {
      var body = new pc.Entity();
      body.name = "box"+i;

      body.addComponent('model', {
        type: "box",
        castShadows: true
      });
      body.addComponent('rigidbody', {
        type: "dynamic"
      });
      body.addComponent('collision', {
        type: "box",
        halfExtents: [0.5, 0.5, 0.5]
      });
      app.root.addChild(body);
      body.model.model.meshInstances[0].material = i % 2 ? black : white;

      this.bricks.push(body);
    }
    blocks =  this.bricks;
    this.reset();
  }

  Wall.prototype.reset = function () {
    for (var i = 0; i < this.bricks.length; i++) {
      var e = this.bricks[i];
      e.rigidbody.teleport(i % 5 - 2, Math.floor(i / 5) + 0.5, 0, 0, 0, 0);
      e.rigidbody.linearVelocity = pc.Vec3.ZERO;
      e.rigidbody.angularVelocity = pc.Vec3.ZERO;
    }
  };

  function Ball() {
    var e = new pc.Entity();
    e.setPosition(0, -10, 0);
    e.addComponent('model', {
      type: "sphere",
      castShadows: true
    });
    e.addComponent('rigidbody', {
      type: "dynamic"
    });
    e.addComponent('collision', {
      type: "sphere",
      radius: 0.5
    });
    var red = createMaterial(1, 0.28, 0.28);
    e.model.model.meshInstances[0].material = red;
    app.root.addChild(e);
    this.entity = e;
  }

  Ball.prototype.fire = function () {
  var e = this.entity;
  e.rigidbody.teleport(0, 2, 5);
  e.rigidbody.linearVelocity = new pc.Vec3((Math.random() - 0.5) * 10, 7, -30);
  e.rigidbody.angularVelocity = pc.Vec3.ZERO;
  };

  // Create the scene
  var camera = new Camera();
  var light = new Light();
  var ground = new Ground();
  var wall = new Wall();
  var ball = new Ball();

  // Reset the wall and fire the ball every 4 seconds
  var n = 0;
  setInterval(function () {
  n++;
  if (n % 4 === 0)
    wall.reset();
  if (n % 4 === 1)
    ball.fire();
  }, 1000);

  app.on("update", function (dt) {
    var data;
    if(io !=null){
      ball.entity.rigidbody.syncEntityToBody();
      //socket.io
      if(OBJIONetworkType == 0){
          //console.log('socket.io object data');
          broadcast('obj',{type:"ball",p:[ball.entity.position.x,ball.entity.position.y,ball.entity.position.z,],r:[ball.entity.rotation.x, ball.entity.rotation.y, ball.entity.rotation.z, ball.entity.rotation.w]});
      }
      //engine.io
      if(OBJIONetworkType == 1){
          //console.log('engine.io object data');
          //convert into string instead of object that it can't read from web browser
          data =  JSON.stringify({type:"ball", p:[ball.entity.position.x,ball.entity.position.y,ball.entity.position.z,],r:[ball.entity.rotation.x, ball.entity.rotation.y, ball.entity.rotation.z, ball.entity.rotation.w]});
          engineiobroadcast(data); //create this function to send out each client
      }
    }

    for (var i = 0; i < blocks.length; i++) {
      blocks[i].rigidbody.syncEntityToBody();
      //socket.io
      if(OBJIONetworkType == 0){
          broadcast('obj',{type:"block",id:i,p:[blocks[i].position.x,blocks[i].position.y,blocks[i].position.z,],r:[blocks[i].rotation.x,blocks[i].rotation.y,blocks[i].rotation.z,blocks[i].rotation.w]});
      }
      //engine.io
      if(OBJIONetworkType == 1){
          //convert into string instead of object that it can't read from web browser
          data =  JSON.stringify({type:"block",id:i,p:[blocks[i].position.x,blocks[i].position.y,blocks[i].position.z,],r:[blocks[i].rotation.x,blocks[i].rotation.y,blocks[i].rotation.z,blocks[i].rotation.w]});
          engineiobroadcast(data); //create this function to send out each client
      }
    }
    data = null;
    camera.update(dt);
  });
}

//=========================================================
// start listen express server
//=========================================================

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("PlayCanvas server listening at", addr.address + ":" + addr.port);
});
