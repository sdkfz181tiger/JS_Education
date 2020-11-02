//==========
// Plugin
// ver 0.0.2
//     2020/10/01_持ち物メニュー機能追加
//     2020/11/02_トグル機能追加

console.log("Hello, base_plugin.js");

const ICON_DIR = "./data/fgimage/default/";// 格納ディレクトリ

// For items
var myFlgs    = {};
var myItems   = {};
var myHand    = {};
var elmBkg    = null;
var elmCursor = null;

function init(fObj){
	myFlgs  = fObj.flgs; // フラグ一覧
	myItems = fObj.items;// アイテム一覧
	readyItemPanel();    // アイテムパネル表示
	readyItemCursor();   // カーソル表示
	readyToggle();       // トグルボタン初期化
}

function setFlg(key, flg){
	console.log("setFlg:" + flg);
	myFlgs[key] = flg;
	readyItemPanel();// Reflesh
}

function getFlg(key){
	if(!myFlgs.hasOwnProperty(key)) return -1;
	return myFlgs[key];
}

function setItem(key, item){
	console.log("setItem:" + item);
	myItems[key] = item;
	readyItemPanel();// Reflesh
}

function getItem(key){
	if(!myItems.hasOwnProperty(key)) return -1;
	return myItems.items[key];
}

//==========
// ItemPanel
function readyItemPanel(){
	//console.log("readyItemPanel");
	// Background
	var w = $("body").width();
	var h = 80;
	if(elmBkg == null){
		elmBkg = $("<p>");
		elmBkg.attr("id", "item_panel");
		elmBkg.css({
			position: "absolute", background: "gray",
			margin: 0, padding: 0, width: w, height: h, top: -h, left: 0
		}).appendTo("body");
	}
	elmBkg.empty();
	// Handle
	var elmHandle = $("<p>");
	elmHandle.css({
		position: "absolute", background: "gray", cursor: "pointer",
		margin: 0, padding: 0, width: 80, height: 24, top: h, left: 0
	}).text("ITEM");
	elmHandle.click(function(e){
		if(elmBkg.offset().top < 0){
			elmBkg.css({top: 0});
		}else{
			elmBkg.css({top: -h});
		}
	});
	elmHandle.appendTo(elmBkg);
	// Items
	var m = 10;
	var s = 60;
	var l = 0;
	for(var key in myItems){
		var item = myItems[key];
		var elmBtn = $("<img>");
		elmBtn.css({
			position: "absolute", background: "pink", cursor: "pointer",
			margin: m, padding: 0, width: s, height: s, top: 0, left: l
		}).text(item);
		elmBtn.attr({alt: key, src: ICON_DIR+item, key: key, item: item});
		elmBtn.click(function(e){
			var key = $(this).attr("key");
			var item = $(this).attr("item");
			if(myHand.key != key){
				grabHand(key, item, e);// Grab something
			}else{
				releaseHand();// Release something
			}
		});
		elmBtn.appendTo(elmBkg);
		l += m + s;// Offset
	}	
}

//==========
// Cursor
function readyItemCursor(){
	console.log("readyItemCursor");
	if(elmCursor == null){
		elmCursor = $("<img>");
		elmCursor.attr("id", "cursor");
		elmCursor.css({
			position: "absolute", background: "orange", visibility: "hidden",
			margin: 0, padding: 0, width: 40, height: 40, top: 0, left: 0
		}).appendTo("body");
		$("#tyrano_base, #item_panel").on("mousemove", function(e){
			elmCursor.css({"top": e.clientY+5, "left": e.clientX+5});
		});
	}
	releaseHand();
}

function grabHand(key, item, e){
	console.log("grabHand:", key, item);
	myHand.key = key;
	myHand.item = item;
	$("#cursor").attr({alt: key, src: ICON_DIR+item});
	$("#cursor").css({visibility: "visible", "top": e.clientY+5, "left": e.clientX+5});
	$("body").css({cursor: "none"});
}

function releaseHand(){
	console.log("releaseHand");
	myHand = {};
	$("#cursor").css({visibility: "hidden"});
	$("body").css({cursor: "auto"});
}

//==========
// Toggle

var tglBkg   = null;
var tglBkgX  = 0;
var tglBkgY  = 0;
var tglBkgW  = 100;
var tglBkgH  = 180;
var tglFiles = [];
var tglBtns  = [];

function readyToggle(x, y, w, h, files){
	console.log("readyToggle");
	tglBkgX  = x;
	tglBkgY  = y;
	tglBkgW  = w;
	tglBkgH  = h;
	tglFiles = files;
}

function createToggle(x, y, i, ans){
	console.log("createToggle");
	var w = $("body").width();
	var h = $("body").height();
	if(tglBkg == null){
		tglBkg = $("<p>");
		tglBkg.attr("id", "tgl_panel");
		tglBkg.css({
			position: "absolute", background: "gray",
			margin: 0, padding: 0, width: tglBkgW, height: tglBkgH, top: tglBkgY, left: tglBkgX
		}).appendTo("body");
	}

	var tglBtn = $("<img>");
	tglBtn.css({
		position: "absolute", background: "aqua", cursor: "pointer",
		margin: 0, padding: 0, top: y, left: x
	});
	tglBtn.attr({src: ICON_DIR+tglFiles[i], i: i, ans: ans});
	tglBtn.click(function(e){
		var n = Number(tglBtn.attr("i")) + 1;// Next
		if(tglFiles.length-1 < n) n = 0;
		tglBtn.attr({src: ICON_DIR+tglFiles[n], i: n});
		if(checkToggles()){// Test
			console.log("おおあたりー");
		}else{
			console.log("ちゃいますよ");
		}
	});
	tglBtn.appendTo(tglBkg);
	tglBtns.push(tglBtn);// Push
}

function checkToggles(){
	if(tglBtns.length <= 0) return false;
	for(var i=0; i<tglBtns.length; i++){
		var tglBtn = tglBtns[i];
		if(tglBtn.attr("i") != tglBtn.attr("ans")) return false;
	}
	return true;
}

function clearToggles(){
	console.log("clearToggles");
	if(tglBkg == null) return;
	tglBkg.remove();
	tglBkg = null;
}