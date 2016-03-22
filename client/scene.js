/*
	Information: Disable Physics for now.
*/

//global access variables
var pc_app;
// cross browser way to add an event listener
function addListener(event, obj, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(event, fn, false);   // modern browsers
    } else {
        obj.attachEvent("on"+event, fn);          // older versions of IE
    }
}
//resize window for the canvas
function setResolution() {
	// if the screen width is less than 640
	// fill the whole window
	// otherwise
	// use the default setting
	var w = window.screen.width;
	var h = window.screen.height;
	//if (w < 640) {
		pc_app.setCanvasResolution(pc.RESOLUTION_AUTO, w, h);
		pc_app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
	//}
}

var CONFIG_FILENAME = 'config.json';
var SCENE_PATH = "416604.json";

addListener("load", window,function(){
	//it need to load the html to get the access to canvas
	var canvas = document.getElementById("application-canvas");
	// Create a PlayCanvas application
	pc_app = new pc.Application(canvas, {});
	setResolution();
	window.addEventListener("resize", setResolution);
	//CreateScene(pc,pc_app);
	/*
	pc_app.loadScene(SCENE_PATH, function (err, scene) {
		if (err) {
			console.error(err);
		}
		pc_app.start();
	});
	*/

	pc_app.configure(CONFIG_FILENAME, function (err) {
        if (err) {
            console.error(err);
        }

		pc_app.loadScene(SCENE_PATH, function (err, scene) {
			if (err) {
				console.error(err);
			}
			pc_app.start();
		});

		/*
		pc_app.preload(function (err) {
			if (err) {
				console.error(err);
			}
			//CreateScene(pc,pc_app);

		});
		*/
	});


});

function CreateScene(pc,app){
    app.start();
    // Fill the available space at full resolution
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
	//light scene
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
	//camera update
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
      	//var en = new pc.Entity();
      	//console.log(en);
		this.bricks = [];

		for (var i = 0; i < 25; i++) {
        	var body = new pc.Entity();
        	body.addComponent('model', {
          		type: "box",
          		castShadows: true
        	});
        	//body.addComponent('rigidbody', {
          		//type: "dynamic"
        		//});
        	//body.addComponent('collision', {
          		//type: "box",
          		//halfExtents: [0.5, 0.5, 0.5]
        	//});
        	app.root.addChild(body);
        	body.model.model.meshInstances[0].material = i % 2 ? black : white;

        	this.bricks.push(body);
      }
      blocks = this.bricks;
      //this.reset();
    }

    Wall.prototype.reset = function () {
      	//for (var i = 0; i < this.bricks.length; i++) {
        	//var e = this.bricks[i];
        	//e.rigidbody.teleport(i % 5 - 2, Math.floor(i / 5) + 0.5, 0, 0, 0, 0);
        	//e.rigidbody.linearVelocity = pc.Vec3.ZERO;
        	//e.rigidbody.angularVelocity = pc.Vec3.ZERO;
      	//}
    };

	function Ball() {
		var e = new pc.Entity();
		e.setPosition(0, -10, 0);
		e.addComponent('model', {
			type: "sphere",
			castShadows: true
		});
		//e.addComponent('rigidbody', {
	        //type: "dynamic"
			//});
		//e.addComponent('collision', {
		//type: "sphere",
			//radius: 0.5
		//});
		var red = createMaterial(1, 0.28, 0.28);
		e.model.model.meshInstances[0].material = red;
		app.root.addChild(e);
		this.entity = e;
	}

	Ball.prototype.fire = function () {
		var e = this.entity;
		//e.rigidbody.teleport(0, 2, 5);
		//e.rigidbody.linearVelocity = new pc.Vec3((Math.random() - 0.5) * 10, 7, -30);
		//e.rigidbody.angularVelocity = pc.Vec3.ZERO;
	};

    // Create the scene
	var camera = new Camera();
	var light = new Light();
    var ground = new Ground();
    var wall = new Wall();
    ball = new Ball();

    // Reset the wall and fire the ball every 4 seconds
    /*
    var n = 0;
    setInterval(function () {
      n++;
      if (n % 4 === 0)
        wall.reset();
      if (n % 4 === 1)
        ball.fire();
    }, 1000);
    */
    // Register an update event to rotate the camera
    //console.log(ball.entity.position.toString());
    //console.log(ball.entity.rigidbody);
    //console.log(ball.entity.rigidbody.entity.position.toString());
	app.on("update", function (dt) {
		camera.update(dt);
	});
}
