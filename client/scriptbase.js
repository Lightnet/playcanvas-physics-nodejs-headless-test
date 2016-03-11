pc.script.create('scriptbase', function (app) {
    // Creates a new Scriptbase instance
    var Scriptbase = function (entity) {
        this.entity = entity;
		console.log("test local?");
    };

    Scriptbase.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
			console.log("test...");
        }
    };

    return Scriptbase;
});
