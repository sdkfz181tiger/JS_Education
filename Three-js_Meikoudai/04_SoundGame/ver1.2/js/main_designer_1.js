
//==========
// モデリングデータの使い方
// MagicaVoxel参考動画
//     https://www.youtube.com/watch?v=MQPENfEOJJg
//
// 1, 3Dモデリングデータは、./models/obj/フォルダに格納しよう
// 2, モデルデータの読み込みは、"data.js"に記述しよう(models)
// 3, 背景に配置する場合は"setSceneryRoot()"関数に記述しよう
// 4, 譜面に配置する場合は"setSceneryNote()"関数に記述しよう

//==========
// サウンドデータの使い方
//
// 1, サウンドデータは、./sounds/フォルダに格納しよう
// 2, モデルデータの読み込みは、"data.js"に記述しよう(sounds)

//==========
// 譜面データの編集の仕方
//
// 1, 譜面データは、"data.js"の(noteData)変数です

//==========
// 背景に配置
function setSceneryRoot1(){
	let group = rootGroup;

	// "rootGroup(背景)"に配置する
	let obj1 = objLoader.findModels("8x8x8.obj", 1.0);
	obj1.position.set(0, 0, -30);// 座標をセット
	group.add(obj1);// 背景に追加

	/*
	// obj1が左右にユラユラ
	// 第一引数: 繰り返し数(-1は無限)
	// 第二引数: ヨーヨー (true / falseのどちらか)
	// 第三引数: アニメーション終了時関数
	let tl1 = createTimeline(0, false, null);
	
	// position 左右ユラユラ
	tl1.to(obj1.position, 1.0, {delay: 0.0, x: "+=5", y: "+=0", z: "+=0"});// 相対位置
	tl1.to(obj1.position, 1.0, {delay: 0.0, x: "-=5", y: "+=0", z: "+=0"});
	tl1.to(obj1.position, 1.0, {delay: 0.0, x: "-=5", y: "+=0", z: "+=0"});// 相対位置
	tl1.to(obj1.position, 1.0, {delay: 0.0, x: "+=5", y: "+=0", z: "+=0"});

	// 1秒間何もしない
	tl1.to(obj1.position, 1.0, {delay: 0.0});
	
	// 途中で何かする
	tl1.add(()=>{
		console.log("We love Yahoo!!");
	});

	// rotation くるくる(3.14 = 180度)
	tl1.to(obj1.rotation, 1.0, {delay: 0.0, x: "+=0", y: "+=3.14", z: "+=0"});// 相対位置
	tl1.to(obj1.rotation, 1.0, {delay: 0.0, x: "+=0", y: "-=3.14", z: "+=0"});
	tl1.to(obj1.rotation, 1.0, {delay: 0.0, x: "+=0", y: "-=3.14", z: "+=0"});// 相対位置
	tl1.to(obj1.rotation, 1.0, {delay: 0.0, x: "+=0", y: "+=3.14", z: "+=0"});

	// 途中で何かする
	tl1.add(()=>{
		console.log("We love Google!!");
	});

	// scale 大きくなったり小さくなったり
	tl1.to(obj1.scale, 1.0, {delay: 0.0, x: "+=3", y: "+=3", z: "+=3"});// 相対位置
	tl1.to(obj1.scale, 1.0, {delay: 0.0, x: "-=3", y: "-=3", z: "-=3"});

	// 同時に起こす(tag1を、マージする)
	tl1.add("tag1");
	tl1.to(obj1.scale,    1.0, {delay: 0.0, x: "+=3", y: "+=3", z: "+=3"}, "tag1");
	tl1.to(obj1.rotation, 1.0, {delay: 0.0, y: "+=3.14"}, "tag1");

	// 同時に起こす(tag2を、マージする)
	tl1.add("tag2");
	tl1.to(obj1.scale,    1.0, {delay: 0.0, x: "-=3", y: "-=3", z: "-=3"}, "tag2");
	tl1.to(obj1.rotation, 1.0, {delay: 0.0, y: "-=3.14"}, "tag2");

	/**/
}

//==========
// 譜面に配置
function setSceneryNote1(){
	let group = noteGroup;

	// "noteGroup(譜面)"に配置する
	let obj1 = objLoader.findModels("8x8x8.obj", 1.0);
	obj1.position.set(0, 5, -30);// 座標をセット
	group.add(obj1);// 譜面に追加
}