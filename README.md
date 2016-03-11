
 #playcanvas physic nodejs headless test

 Created by: Lightnet

 licenses: CC0

 Information: Very basic setup for nodejs server playcanvas. Without modifying
the files of playcanvas-latest/stable.js and ammo.js to run headless server
nodejs. Server and client is almost the same setup for playcanvas scene on both
side.

Socket.io and Engine.io tested send data objects.

Socket.io (local test pass/host test pass)

Engine.io (local test pass/host test fail)
 Using the https is tricky since I have not yet config to work yet. That is 
do self work to config right.
 
Local testing work well on local pc test but it doesn't work well trying outside
pc network.


```
server.js
// 0 = socket.io
// 1 = engine.io
OBJIONetworkType = 1;

bConfigPlayCanvas = false; //config.json <id scene>.json not working yet.
```

This is to send out the object data since I config for testing.

 Require packages:
  * express
  * socket.io
  * async
  * ammo.js (Need for playcanvas on server side nodejs package that can be install)
  * jsdom (To emulator for web browser)

 Install: (cmd line)
  * npm install

 Note:
 * PlayCanvas config/setting json load are not test for server and client side.
 * http restricted access need to put files that are own by site for reason is
 security reason.
 * Ammo.js might crash or fail on setup. Depend on where the code is place server
 side.
 * Engine.io is a bit bare functions on server and not much document for beginner 
 used. It is hard learning curve.
 * jsdom (nw.js v0.12.3 bugged 64 bit run to some error.)

 Credits:
 * Ammo.js
 * Playcanvas and to the community and forums.

Builds of head revision of the GitHub repo:
 * https://code.playcanvas.com/playcanvas-latest.js
 * https://code.playcanvas.com/playcanvas-latest.min.js

Builds of latest stable release:
 * https://code.playcanvas.com/playcanvas-stable.js1
 * https://code.playcanvas.com/playcanvas-stable.min.js1

Builds of specific engine version:
 * https://code.playcanvas.com/playcanvas-0.181.11.js1
 * https://code.playcanvas.com/playcanvas-0.181.11.min.js
