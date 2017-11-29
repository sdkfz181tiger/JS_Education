console.log("Hello p5.js!!");

const DEG_TO_RAD  = Math.PI / 180;

let invaders;

// 初期化
function setup(){
	console.log("setup");
	createCanvas(480, 320);
	frameRate(8);
	background(0);

	fill(255, 255, 255);
	noStroke();

	// Invader
	invaders = [];
	let padding = 32;
	let cols = width / padding;
	let rows = height / padding;
	for(let r=0; r<rows; r++){
		for(let c=0; c<cols; c++){
			let invader = new Invader(c*padding, r*padding);
			invaders.push(invader);
		}
	}
}

// 連続処理
function draw(){
	console.log("draw");
	background(0);

	for(invader of invaders){
		invader.draw();
	}

	let rdm = Math.floor(Math.random() * invaders.length);
	for(let i=0; i<invaders.length; i++){
		if(i == rdm){
			invaders[i].init();
		}
		invaders[i].draw();
	}
}

class Invader{

	constructor(x, y){
		this._x = x;
		this._y = y;
		this._r = Math.floor(Math.random() * 100) + 155;
		this._g = Math.floor(Math.random() * 100) + 155;
		this._b = Math.floor(Math.random() * 100) + 155;
		this._size = 2;

		this.init();
	}

	init(){
		this._seed = "";
		for(let i=0; i<32; i++){
			this._seed += "1";
		}
		this._max = parseInt(this._seed, 2);
		this._num = Math.floor(Math.random() * this._max);
		this._str = this._num.toString(2);

		if(this._str.length < 32){
			let total = 32 - this._str.length;
			let prefix = "";
			for(let i=0; i<total; i++){
				prefix += "0";
			}
			this._str = prefix + this._str;
		}
		//console.log("num:" + this._num + " / " + this._max);
	}

	draw(){
		fill(this._r, this._g, this._b);

		// Body
		for(let i=0; i<this._str.length; i++){
			if(this._str[i] === "1"){
				let odd = i % 4;
				let lX = this._x + this._size * odd;
				let lY = this._y + this._size * Math.floor(i / 4);
				rect(lX, lY, this._size, this._size);
				let rX = this._x - this._size * (odd-7);
				let rY = lY
				rect(rX, rY, this._size, this._size);
			}
		}
	}
}