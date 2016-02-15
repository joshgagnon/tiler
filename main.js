// http://mrl.nyu.edu/~perlin/noise/

var ImprovedNoise = function () {

	var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,
		 23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
		 174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
		 133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
		 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,
		 202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
		 248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
		 178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,
		 14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,
		 93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

	for (var i=0; i < 256 ; i++) {

		p[256+i] = p[i];

	}

	function fade(t) {

		return t * t * t * (t * (t * 6 - 15) + 10);

	}

	function lerp(t, a, b) {

		return a + t * (b - a);

	}

	function grad(hash, x, y, z) {

		var h = hash & 15;
		var u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
		return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);

	}

	return {

		noise: function (x, y, z) {

			var floorX = ~~x, floorY = ~~y, floorZ = ~~z;

			var X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;

			x -= floorX;
			y -= floorY;
			z -= floorZ;

			var xMinus1 = x -1, yMinus1 = y - 1, zMinus1 = z - 1;

			var u = fade(x), v = fade(y), w = fade(z);

			var A = p[X]+Y, AA = p[A]+Z, AB = p[A+1]+Z, B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;

			return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
							grad(p[BA], xMinus1, y, z)),
						lerp(u, grad(p[AB], x, yMinus1, z),
							grad(p[BB], xMinus1, yMinus1, z))),
					lerp(v, lerp(u, grad(p[AA+1], x, y, zMinus1),
							grad(p[BA+1], xMinus1, y, z-1)),
						lerp(u, grad(p[AB+1], x, yMinus1, zMinus1),
							grad(p[BB+1], xMinus1, yMinus1, zMinus1))));

		}
	}
}

require.config({
  shim: {
    underscore: {
      exports: '_'
    },
  }
});

var Key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    onKeydown: function(event) {
    	if(event.keyCode!==116)
        	event.preventDefault();

        this._pressed[event.keyCode] = true;
        return false;
    },

    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
        return false;
    }
};

window.addEventListener('keyup', function(event) {
    Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function(event) {
    Key.onKeydown(event);
}, false);


//the "main" function to bootstrap your code
require(['underscore'], function (_) {

	var tiles_x = 100;
	var tiles_y = 100;
	var tile_size = 256;
	var world_size_x = tiles_x*tile_size;
	var world_size_y = tiles_y*tile_size;
	var block_size = 16;
	var block_x = parseInt(world_size_x / block_size,10);
	var block_y = parseInt(world_size_y / block_size,10);
	var time, clock;
	var tick = 0;

	var wd = window;
	if (!wd.requestAnimationFrame) {
	    wd.requestAnimationFrame =
	    wd.webkitRequestAnimationFrame ||
	    wd.mozRequestAnimationFrame ||
	    wd.oRequestAnimationFrame ||
	    wd.msRequestAnimationFrame ||
	    function(cb, element) {
	        wd.setTimeout(cb, 1000 / 60);
	    };
	}

   	var stats = document.createElement("div");
    stats.style.position = 'absolute';
    stats.style.bottom = '0px';
    stats.style.zIndex = 100;
   	document.body.appendChild( stats );


   	var Block = function(){

   	}

   	var Terrain = new (function(block_x, block_y){
   		console.log(world_size_x * world_size_y / block_size/1024/1024);
   		//var data = new Uint16Array(block_x * block_y);

	    function generateHeight() {
	        var size = block_x * block_y,
	        perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;
	        for ( var j = 0; j < 4; j ++ ) {
	            for ( var i = 0; i < size; i ++ ) {
	                var x = i % block_x, y = ~~ ( i / block_x );
	                data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
	            }
	            quality *= 5;
	        }
	        return data;
	    }

	   //generateHeight();

   	})(block_x, block_y);


	var Tile = function(x, y, size){

		var self = this;
		this.x = x;
		this.y = y;
		this.world_x = this.x*size;
		this.world_y = this.y*size;
		this.size = size;
		this.draw_tile = function(){
			self.canvases = [];
			self.frame = 0;
			self.frame_count = 1;
			var create = function(r, g, b){
				var canvas = document.createElement("canvas");
				var context = canvas.getContext("2d");
				canvas.width = canvas.height = size;
			    var step = size;//size / 32;
			    var flip = true;
			    context.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
				for (var i = 0; i < size; i += step) {
			        for (var j = 0; j < size; j += step) {
			            if (flip) {
			                context.fillRect(i, j, step, step);
			            }
			            flip = !flip;
			        }
			        flip = !flip;
			    }
				return canvas;
			}
			var r = Math.floor((Math.random()*255)+1);
			var g = Math.floor((Math.random()*255)+1);
			var b= Math.floor((Math.random()*255)+1);
		    for(var i =0;i < self.frame_count;i++){
		    	r+=10;
		    	g-=10;
		    	self.canvases.push(create(r, g, b));
		    }


		};
		   /* context.font = 'normal 20px Calibri';
		    context.fillStyle = "rgb(0,0,0)";
		    context.fillText(x + ', '+ y, 10, 50);*/

		this.update = function(){
			this.canvas = self.canvases[self.frame++];
			self.frame %= self.frame_count;
		};
		this.draw_tile();
		this.update();
	}

	var Tiles = new (function(tiles_x, tiles_y){
		var self = this;
		this.tiles = new Array(tiles_x * tiles_y);
		this.recent_tiles = [];
		this.access_tile = function(i, j){
			/* lazily deserialize them as need */
			if((j + i*tiles_x < 0) ||( j + i*tiles_x) > self.tiles.length)
				return;
			if(!self.tiles[j + i*tiles_x]){
				self.tiles[j + i*tiles_x] = new Tile(i, j, tile_size);
			}
			var t = self.tiles[j + i*tiles_x];
			t.last_visited = tick;
			/*var index = self.recent_tiles.indexOf(j + i*tiles_x);
			if(index===-1)
				self.recent_tiles.push(j + i*tiles_x);*/
			return t;
		};
		this.cull = function(){
			for(var k = self.recent_tiles.length-1; k>=0; k--){
				var t = self.tiles[self.recent_tiles[k]];
				if(tick - t.last_visited > 100){
					delete self.tiles[self.recent_tiles[k]];
					self.recent_tiles.splice(k, 1);
				}
			}
		};
	})(tiles_x, tiles_y);




	var width = 1024;
	var height = 1024;

	function onWindowResize( event ) {
 		width =  window.innerWidth - 50;
 		height = window.innerHeight - 50;
 		canvas.width = width;
    	canvas.height = height;
 	}

	var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style['-webkit-transform'] ='translateZ(0)';
   	var context = canvas.getContext("2d");
   	canvas.id = 'screen';
	document.body.appendChild(canvas);

	var camera = [world_size_x/2, world_size_y/2];

	var speed = 5;
	var dt = 0;
	window.addEventListener( 'resize', onWindowResize, false );
 	onWindowResize();

	var step = function(){
		tick++;
		requestAnimationFrame(step);
    	/*
    	var now = new Date().getTime();
        dt = now-dt; //(now - (time || now)) *0.1 + dt*0.9 ;
	    time = now;
	    if(tick%100)
	    	stats.innerHTML = dt.toFixed(1);*/
		/*if(Key.isDown(Key.RIGHT)) camera[0]+=speed;
		if(Key.isDown(Key.LEFT)) camera[0]-=speed;
		if(Key.isDown(Key.DOWN)) camera[1]+=speed;
		if(Key.isDown(Key.UP)) camera[1]-=speed;*/

		/*camera[0] = Math.max(camera[0],  0);
		camera[0] = Math.min(camera[0], world_size_x - width/2);
		camera[1] = Math.max(camera[1],  0);
		camera[1] = Math.min(camera[1], world_size_y - height/2);*/
		//if(tick%100==0){
		camera[0]+=Math.cos(tick/100) *speed ;//speed;
		camera[1]+=Math.sin(tick/100) *speed;;
		//}
		var tile_pos = [Math.floor(camera[0]/tile_size), Math.floor(camera[1]/tile_size)];

		context.clearRect(0,0, width, height);
		var x_range =2;// Math.ceil(width/tile_size) +2;
		var y_range =2;// Math.ceil(height/tile_size) + 2;
		for(var i = Math.max(0, tile_pos[0]-x_range); i <= Math.min(tiles_x-1, tile_pos[0]+x_range); i += 1) {
	        for(var j = Math.max(0, tile_pos[1]-y_range); j <= Math.min(tiles_y-1, tile_pos[1]+y_range); j += 1) {
	        	var tile = Tiles.access_tile(i, j);
	        	//tile.update();
	        	if(tile)
					context.drawImage(tile.canvas, (tile.world_x - camera[0]) + width/2, (tile.world_y - camera[1]) + height/2);
				//if(i==0 && tick%1000==0) console.log(tile)
			}
		}
		//Tiles.cull();

	}
	//onWindowResize();
	requestAnimationFrame(step);

});





