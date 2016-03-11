//global access variables
var ball; //class ball function
var blocks; //array of bricks object

//===============================================
// Socket.io
//===============================================
var socket = io.connect();
socket.on('connect', function () {
	console.log("socket.io connect");
});
socket.on('disconnect', function () {
	console.log("socket.io disconnect");
});
socket.on('obj', function (msg) {
	var p;
	var r;
	var quat;
	//console.log(typeof msg);
	if(msg['type'] == 'ball'){
		if(typeof ball != 'undefined'){
			p = msg['p']; //position [x, y, z]
			r = msg['r']; //rotation [x, y, z, w]
			ball.entity.setPosition(p[0],p[1],p[2]);
			quat = new pc.Quat(r[0],r[1],r[2],r[3]);
			ball.entity.setRotation(quat);//warp/deform scale object
		}
	}

	if(msg['type'] == 'block'){
		if(typeof blocks != 'undefined'){
			p = msg['p'];
			r = msg['r'];
			blocks[msg['id']].setPosition(p[0],p[1],p[2]);
			quat = new pc.Quat(r[0],r[1],r[2],r[3]);
			blocks[msg['id']].setRotation(quat);
		}
	}
	p=null;
	r=null;
	quat=null;
});
//===============================================
//engine.io
//===============================================
//var engineio = eio('ws://localhost:3000');
var engineio = eio();
engineio.on('open', function(){
    //console.log("client web browser");
    //console.log(socket);
    socket.send('pong');
    engineio.on('message', function(data){
        //console.log("-----");
        //console.log(typeof data);
        //console.log(data);
        var searchindex = data.search('type'); //search type in the string
        if(searchindex > 0){
            if(typeof data === 'string'){
                //console.log('pass');
                try{//try to sure there is data matches
                    var p;
                    var r;
                    var quat;
                    var obj = JSON.parse(data);
                    //console.log(obj['type']);
                    if(obj['type'] == 'ball'){
                        if(typeof ball != 'undefined'){
                            p = obj['p']; //position [x, y, z]
                            r = obj['r']; //rotation [x, y, z, w]
                            ball.entity.setPosition(p[0],p[1],p[2]);
                            quat = new pc.Quat(r[0],r[1],r[2],r[3]);
                            ball.entity.setRotation(quat);
                        }
                    }
                    if(obj['type'] == 'block'){
                        if(typeof blocks != 'undefined'){
                            p = obj['p']; //position [x, y, z]
                            r = obj['r']; //rotation [x, y, z, w]
                            blocks[obj['id']].setPosition(p[0],p[1],p[2]);
                            quat = new pc.Quat(r[0],r[1],r[2],r[3]);
                            blocks[obj['id']].setRotation(quat);
                        }
                    }
                    p=null;
                    p=null;
                    quat=null;
                    obj=null;
                }catch (error){
                    console.log(error);
                }
            }
        }else{//display other strings
            console.log("||---");
            console.log(typeof data);
            console.log(data);
        }
    });
    engineio.on('close', function(){
        console.log("engine.io user close");
    });
    console.log("engine.io user open!");
});
