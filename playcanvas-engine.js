//=========================================================
// Browser variable setup
//=========================================================
const fs = require('fs');
var broadcast;
exports.socketio_boardcast=function(obj){
	broadcast = obj;
};
var engineiobroadcast;
exports.engineio_boardcast=function(obj){
	engineiobroadcast = obj;
};

console.log("playcavnas engine server side");
window ={};
document = {};
Ammo = {};
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
var jsdom = require("jsdom").jsdom;
var cdocument = jsdom("<html><body><canvas id='application-canvas'></canvas></body></html>", {});

var jsdom = require("jsdom");
jsdom.env({
	url: "http://127.0.0.1:3000/",
	onload: function( owindow ) {
        //console.log(owindow.location.href); // http://localhost/?something=not#hash
        //console.log(owindow.location.hash); // #hash
		window = owindow;
		document = window.document;
		Ammo = require('ammo.js');
		SetUpBrowser();
    }
});
/*
console.log(OBJIONetworkType);
console.log(window.location.href);
console.log(document.URL);
*/
XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
Image = function(){};

function loadJson(url, func){
    //Loads the requested URL and runs the supplied function when loaded
    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var myArr = JSON.parse(req.responseText);
			console.log("load?");
            func(myArr);
        }
    }
    req.open("GET", url, true);
    req.send();
}


var CONFIG_FILENAME = 'http://127.0.0.1:3000/config.json';
var SCENE_PATH = "http://127.0.0.1:3000/416604.json";
var canvas;
function SetUpBrowser(){
	console.log('SetUpBrowser');
	canvas = cdocument.getElementById("application-canvas");
	//override function to null webgl for headless functions
	canvas.getContext = function(canvas,options){
	    //webgl_null functions
	    return new webgl_null();
	}
	//override boolean to run headless else console.log error
	window.WebGLRenderingContext = true;
	//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	SetUpPlayCanvas();
}
//=========================================================
//set up playcanvas app
//=========================================================
function SetUpPlayCanvas(){
	console.log('SetUpPlayCanvas');
	pc = require('./client/playcanvas-latest-mod.js').pc;

	//require('./client/scriptbase.js');
	//console.log(canvas);
	app = new pc.Application(canvas,{});
	//console.log(app.loader);
	//app.loader.load('http://127.0.0.1:3000/client/scriptbase.js', "script");

	//var buf = fs.readFileSync('./client/scriptbase.js', "utf8");
	//console.log(buf);
	//eval(buf);

	setTimeout(function(){
		InitPC();
	},3000);
	//console.log("????>");
	//loadJson('http://127.0.0.1:3000/client/scriptbase.js',function(){
		//console.log("loaded?");
	//});
	//console.log("<????");

	//Ammo = require('ammo.js');

}

function InitPC(){
	console.log('InitPC');
	//console.log(app);
	if(!bConfigPlayCanvas){
		console.log("create scene");
		CreateScene();
	}else{
		/* //need the config for the physics
		app.loadScene(SCENE_PATH, function (err, scene) {
			console.log("==============================app loadScene?");
			if (err) {
				console.log(err);
			}
			app.start();
			console.log("========================start?");
		});
		*/

		CreateScene0();


		/*
		console.log("CONFIG_FILENAME");
		app.configure(CONFIG_FILENAME, function (err) {
			//console.log("configure?");
			//if (err) {
				//console.log(err);
			//}
			console.log("next loadScene?");
			//CreateScene(pc,pc_app);

			//app.preload(function (err) {
				//console.log("preload?");
				//if (err) {
					//console.log(err);
				//}
			//});

			app.loadScene(SCENE_PATH, function (err, scene) {
				console.log("loadScene?");
				if (err) {
					console.log(err);
				}
				app.start();
				console.log("start?");
			});
			console.log("end config...");
		});
		*/
	}
	console.log('END InitPC');
}

function CreateScene0(){
	console.log("simple script test.");
	setTimeout(function(){
		app.start();
		var simplescript = new pc.Entity();
		simplescript.addComponent('script',{
			url:'http://127.0.0.1:3000/client/scriptbase.js'
		});
		app.root.addChild(simplescript);
	}, 3000);
}

function CreateScene(){
	console.log("create scene...");
	var blocks;
	//playcanvas start app
	app.start();
	// Fill the available space at full resolution
	app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
	app.setCanvasResolution(pc.RESOLUTION_AUTO);
	//light
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
	//wall reset brick position
	Wall.prototype.reset = function () {
		for (var i = 0; i < this.bricks.length; i++) {
			var e = this.bricks[i];
			e.rigidbody.teleport(i % 5 - 2, Math.floor(i / 5) + 0.5, 0, 0, 0, 0);
			e.rigidbody.linearVelocity = pc.Vec3.ZERO;
			e.rigidbody.angularVelocity = pc.Vec3.ZERO;
		}
	};
	//create ball
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
	//fire ball reset
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
	//update scene to send to clients
	app.on("update", function (dt) {
	var data;
	ball.entity.rigidbody.syncEntityToBody();

	//socket.io
	if(OBJIONetworkType == 0){
		if(typeof broadcast == 'function'){
			//console.log('socket.io object data');
			broadcast('obj',{type:"ball",p:[ball.entity.position.x,ball.entity.position.y,ball.entity.position.z,],r:[ball.entity.rotation.x, ball.entity.rotation.y, ball.entity.rotation.z, ball.entity.rotation.w]});
		}
	}
	//engine.io
	if(OBJIONetworkType == 1){
		//console.log('engine.io object data');
		//convert into string instead of object that it can't read from web browser
		if(typeof engineiobroadcast == 'function'){
			data =  JSON.stringify({type:"ball", p:[ball.entity.position.x,ball.entity.position.y,ball.entity.position.z,],r:[ball.entity.rotation.x, ball.entity.rotation.y, ball.entity.rotation.z, ball.entity.rotation.w]});
			engineiobroadcast(data); //create this function to send out each client
		}
	}

	for (var i = 0; i < blocks.length; i++) {
		blocks[i].rigidbody.syncEntityToBody();
		//socket.io
		if(OBJIONetworkType == 0){
			if(typeof broadcast == 'function'){
				broadcast('obj',{type:"block",id:i,p:[blocks[i].position.x,blocks[i].position.y,blocks[i].position.z,],r:[blocks[i].rotation.x,blocks[i].rotation.y,blocks[i].rotation.z,blocks[i].rotation.w]});
			}
		}
		//engine.io
		if(OBJIONetworkType == 1){
			if(typeof engineiobroadcast == 'function'){
				//convert into string instead of object that it can't read from web browser
				data =  JSON.stringify({type:"block",id:i,p:[blocks[i].position.x,blocks[i].position.y,blocks[i].position.z,],r:[blocks[i].rotation.x,blocks[i].rotation.y,blocks[i].rotation.z,blocks[i].rotation.w]});
				engineiobroadcast(data); //create this function to send out each client
			}
		}
	}

	data = null;
	//rotate camera
	camera.update(dt);
	});
}
