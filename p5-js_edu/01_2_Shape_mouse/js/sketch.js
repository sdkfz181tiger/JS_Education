//==========
// p5.js
// -> https://p5js.org/
// References(使い方)
// -> https://p5js.org/reference/
// Examples(使用例)
// -> https://p5js.org/examples/

//==========
// p5.play
// -> http://p5play.molleindustria.org/
// References(使い方)
// -> http://p5play.molleindustria.org/docs/classes/Sprite.html
// Examples(使用例)
// -> http://p5play.molleindustria.org/examples/index.html

console.log("Hello p5.js!!");

const DISP_W = 480;
const DISP_H = 320;

function preload(){
	console.log("preload");
}

function setup(){
	console.log("setup");
	createCanvas(DISP_W, DISP_H);
	frameRate(8);
	background(0, 0, 0);
	fill(255, 255, 255);
}

function draw(){
	//console.log("draw");
}

function mousePressed(){
	//console.log("mousePressed");

	// Ellipse
	noStroke();
	fill(255, 33, 33);
	ellipse(mouseX, mouseY, 20, 20);
}

function mouseMoved(){
	//console.log("mouseMoved");

	// Ellipse
	noStroke();
	fill(33, 255, 33);
	ellipse(mouseX, mouseY, 20, 20);
}

function mouseReleased(){
	//console.log("mouseRelased");

	// Ellipse
	noStroke();
	fill(33, 33, 255);
	ellipse(mouseX, mouseY, 20, 20);
}
