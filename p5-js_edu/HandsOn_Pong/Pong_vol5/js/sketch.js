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

//==========
// HandsOn資料
// -> http://ozateck.sakura.ne.jp/wordpress

console.log("Hello p5.js!!");

const DISP_W = 480;
const DISP_H = 320;

let ball;

let wallT;
let wallB;
let wallL;
let wallR;

let padL;
let padR;

let soundPong;

let scoreL;
let scoreR;

function preload(){
	console.log("preload");

	// Sound
	soundPong = loadSound("assets/s_pong.mp3");

	// Font
	var font = loadFont("assets/misaki_gothic.ttf");
	textFont(font);
}

function setup(){
	console.log("setup");
	createCanvas(DISP_W, DISP_H);
	frameRate(64);
	background(0, 0, 0);
	fill(255, 255, 255);

	ball = createSprite(240, 160, 16, 16);
	resetBall();

	wallT = createSprite(240, 0, 480, 8);
	wallT.immovable = true;

	wallB = createSprite(240, 320, 480, 8);
	wallB.immovable = true;

	wallL = createSprite(0, 160, 8, 320);
	wallL.immovable = true;

	wallR = createSprite(480, 160, 8, 320);
	wallR.immovable = true;

	padL = createSprite(80, 160, 16, 80);
	padL.immovable = true;

	padR = createSprite(400, 160, 16, 80);
	padR.immovable = true;

	scoreL = 0;
	scoreR = 0;
}

function draw(){
	//console.log("draw");
	background(0, 0, 0);

	ball.bounce(wallT);
	ball.bounce(wallB);

	if(ball.bounce(wallL)){
		scoreR += 1;
		resetBall();
	}

	if(ball.bounce(wallR)){
		scoreL += 1;
		resetBall();
	}

	if(ball.bounce(padL)){
		soundPong.play();
	}

	if(ball.bounce(padR)){
		soundPong.play();
	}

	// Message
	textSize(32);
	textAlign(CENTER);
	text(scoreL, 100, 60);
	text(scoreR, 380, 60);

	drawSprites();
}

function keyPressed(){
	console.log("keyPressed:", keyCode);

	// A
	if(keyCode == 65){
		padL.position.y -= 10;
	}

	// Z
	if(keyCode == 90){
		padL.position.y += 10;
	}

	// K
	if(keyCode == 75){
		padR.position.y -= 10;
	}

	// M
	if(keyCode == 77){
		padR.position.y += 10;
	}
}

function resetBall(){
	console.log("resetBall");

	let rdm = random(0, 20);
	let angle = rdm - 10;
	let odd = floor(rdm) % 2;
	if(odd == 0) angle += 180;
	ball.setSpeed(2, angle);
	ball.position.x = 240;
	ball.position.y = 160;
}