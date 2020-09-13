
let cX, cY;

let mySound;
let myAmp;
let myFft;

function preload(){
	console.log("preload!!");
	// Load
	soundFormats("mp3", "ogg");
	mySound = loadSound("../sounds/bgm.mp3");
}

function setup(){
	console.log("setup!!");
	createCanvas(windowWidth,windowHeight);
	angleMode(DEGREES);
	frameRate(8);
	stroke(255);
	strokeWeight(2);
	strokeCap(SQUARE);

	cX = width / 2;
	cY = height / 2;
	
	// Amplitude analyzer
	// Firefox, Chromeでの下記クラスエラー発生の為、保留!!
	//myAmp = new p5.Amplitude();
	//myAmp.setInput(mySound);
	// FFT
	//myFft = new p5.FFT();
}

function mousePressed(){

	mySound.play();
}