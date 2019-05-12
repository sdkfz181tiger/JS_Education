console.log("utility.js!!");

const OS_Android = "Android";
const OS_iPhone  = "iPhone";
const OS_iPad    = "iPad";
const OS_iPod    = "iPod";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const SIZE_GRID  = 10;

// Three.js
class ThreeManager{

	constructor(pcX=0, pcY=0, pcZ=0){
		console.log("ThreeManager");

		// PC or Smartphone
		this._modeAndroid = false;
		this._modeiOS     = false;
		if(navigator.userAgent.indexOf(OS_Android) > 0) this._modeAndroid = true;
		if(navigator.userAgent.indexOf(OS_iPhone)  > 0) this._modeiOS = true;
		if(navigator.userAgent.indexOf(OS_iPad)    > 0) this._modeiOS = true;
		if(navigator.userAgent.indexOf(OS_iPod)    > 0) this._modeiOS = true;

		console.log("_modeAndroid:" + this._modeAndroid);
		console.log("_modeiOS:" + this._modeiOS);

		// Scene
		this._scene = new THREE.Scene();

		// Group
		this._group = new THREE.Group();
		this._scene.add(this._group);

		// Axes
		this._axes = new THREE.AxesHelper(5);
		this._group.add(this._axes);

		// Stats
		this._stats = new Stats();
		this._stats.setMode(0);
		this._stats.domElement.style.position = "absolute";
		this._stats.domElement.style.left     = "0px";
		this._stats.domElement.style.top      = "0px";
		document.body.appendChild(this._stats.domElement);

		// Camera
		this._camera = new THREE.PerspectiveCamera(
			75, window.innerWidth/window.innerHeight, 0.1, 1000);

		// Container(for VR)
		this._cameraContainer = new THREE.Object3D();
		this._cameraContainer.add(this._camera);
		this._scene.add(this._cameraContainer);

		// PC or DeviceOrientation
		if(this._modeAndroid == false && this._modeiOS == false){
			console.log("This is PC!!");
			// Camera
			this._camera.position.set(pcX, pcY, pcZ);// PCでポジションを移動させる場合
			this._cameraContainer.rotation.set(0*DEG_TO_RAD, 0*DEG_TO_RAD, 0*DEG_TO_RAD);
			// Controls
			this._controls = new THREE.TrackballControls(this._camera);// Cameraのみ対応
			this._controls.target.set(0, 0, 0);
		}else{
			console.log("This is Smartphone!!");
			// Camera
			this._cameraContainer.position.set(pcX, pcY, pcZ);
			this._cameraContainer.rotation.set(0*DEG_TO_RAD, 0*DEG_TO_RAD, 0*DEG_TO_RAD);
			// Controls(DeviceOrientation)
			this._controls = new THREE.DeviceOrientationControls(this._camera);
		}

		// HemiLight
		this._hemiLight = new THREE.HemisphereLight(0x3333ff, 0x3333ff, 0.7);
		this._hemiLight.position.set(0, 30, 0);
		this._hemiLight.color.setHSL(0.7, 0.7, 0.7);
		this._hemiLight.groundColor.setHSL(1, 1, 1);
		this._scene.add(this._hemiLight);
		this._hemiLightHelper = new THREE.HemisphereLightHelper(this._hemiLight, 10);
		this._scene.add(this._hemiLightHelper);

		// Light
		this._dirLight = new THREE.DirectionalLight(0xffffff);
		this._dirLight.position.set(-15.0, 30.0, 15.0);
		this._scene.add(this._dirLight);
		this._dirLightHelper = new THREE.DirectionalLightHelper(this._dirLight, 5);
		this._scene.add(this._dirLightHelper);

		// Renderer
		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setClearColor(0x666666);
		this._renderer.gammaOutput = false;
		this._renderer.gammaFactor = 1.2;
		document.body.appendChild(this._renderer.domElement);

		// CSS2DRenderer
		this._cssRenderer = new THREE.CSS2DRenderer();
		this._cssRenderer.setSize(window.innerWidth, window.innerHeight);
		this._cssRenderer.domElement.style.position = "absolute";
		this._cssRenderer.domElement.style.top = 0;
		document.body.appendChild(this._cssRenderer.domElement);

		// Wire
		this.createWire(14, 14, SIZE_GRID, {color: 0x999999});

		// Raycaster(for PC)
		let mouseVector = new THREE.Vector3();
		let raycaster = new THREE.Raycaster();
		this._raycasterListener = null;

		// Resize
		window.addEventListener("resize", (e)=>{
			this._camera.aspect = window.innerWidth / window.innerHeight;
			this._camera.updateProjectionMatrix();
			this._renderer.setSize(window.innerWidth, window.innerHeight);
			this._cssRenderer.setSize(window.innerWidth, window.innerHeight);
		}, false);

		// Click
		let type = "click";
		if(this._modeAndroid == true) type = "click";
		if(this._modeiOS == true)     type = "touchstart";
		window.addEventListener(type, (e)=>{
			event.preventDefault();
			let x = (e.layerX/window.innerWidth)*2-1;
			let y = - (e.layerY/window.innerHeight)*2+1;
			mouseVector.set(x, y, 0.0);
			raycaster.setFromCamera(mouseVector, this._camera);
			let intersects = raycaster.intersectObject(this._group, true);
			if(this._raycasterListener != null && 0 < intersects.length){
				this._raycasterListener(intersects);// Callback
			}
		}, false);
	}

	update(){
		// Stats
		this._stats.update();

		// Controls(for PC and Devices)
		this._controls.update();

		// Render
		this._renderer.render(this._scene, this._camera);

		// CSS2DRenderer
		this._cssRenderer.render(this._scene, this._camera);
	}

	getScene(){
		return this._scene;
	}

	getGroup(){
		return this._group;
	}

	getCamera(){
		return this._camera;
	}

	getCameraContainer(){
		return this._cameraContainer;
	}

	//==========
	// ClickEvent
	setRaycasterListener(callback){
		this._raycasterListener = callback;
	}

	//==========
	// Skybox
	createSkybox(path, total, scale){
		let textures = [];
		for(let i=0; i<total; i++){
			textures[i] = new THREE.Texture();
		}
		let img = new Image();
		img.onload = ()=>{
			let canvas, context;
			let size = img.height;
			for(let i=0; i < textures.length; i++){
				canvas  = document.createElement("canvas");
				context = canvas.getContext("2d");
				canvas.width = size; canvas.height = size;
				context.drawImage(
					img, size*i, 0, size, size, 0, 0, size, size);
				textures[i].image = canvas
				textures[i].needsUpdate = true;
			}
		};
		img.src = path;

		let materials = [];
		for(let i=0; i<textures.length; i++){
			materials.push(new THREE.MeshBasicMaterial({map: textures[i]}));
		}

		let skybox = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), materials);
		skybox.geometry.scale(scale, scale, -scale);
		skybox.position.set(0, 0, 0);
		return skybox;
	}

	//==========
	// Wire
	createWire(rows, cols, p, color){

		let sX = -p*cols*0.5;
		let sY = 0;
		let sZ = -p*rows*0.5;
		let material = new THREE.LineBasicMaterial(color);
		for(let r=0; r<=rows; r++){
			let h = new THREE.Geometry();
			h.vertices.push(new THREE.Vector3(sX, sY, sZ+p*r));
			h.vertices.push(new THREE.Vector3(sX+p*cols, sY, sZ+p*r));
			this._scene.add(new THREE.Line(h, material));
		}
		for(let c=0; c<=cols; c++){
			let v = new THREE.Geometry();
			v.vertices.push(new THREE.Vector3(sX+p*c, sY, sZ));
			v.vertices.push(new THREE.Vector3(sX+p*c, sY, sZ+p*cols));
			this._scene.add(new THREE.Line(v, material));
		}
	}
}

// ObjLoader
class ObjLoader{

	constructor(){
		console.log("ObjLoader");
	}

	loadModels(models, onSuccess, onError){
		let promises = [];
		for(let i=0; i<models.data.length; i++){
			let data = models.data[i];
			promises.push(
				this.asyncModel(data.dir, data.mtl, data.obj));
		}
		Promise.all(promises).then((results)=>{
			this._models = results;// Models
			onSuccess();
		}, (error)=>{
			console.log(error);
			onError();
		});
	}

	findModels(name){
		for(let i=0; i<this._models.length; i++){
			if(this._models[i].name != name) continue;
			return this._models[i].clone();
		}
		return null;
	}

	asyncModel(dir, mtl, obj){
		return new Promise((resolve, reject)=>{
			// MTLLoader
			let mtlLoader = new THREE.MTLLoader();
			mtlLoader.setPath(dir);
			mtlLoader.load(mtl, (materials)=>{
				materials.preload();
				// OBJLoader
				let objLoader = new THREE.OBJLoader();
				objLoader.setPath(dir);
				objLoader.setMaterials(materials);
				objLoader.load(obj, (meshes)=>{
					meshes.children.forEach((mesh)=>{
						mesh.geometry.computeFaceNormals();
						mesh.geometry.computeVertexNormals();
					});
					meshes.name = obj;// Name
					resolve(meshes);  // Resolve
				});
			}, (progress)=>{
				//console.log("onProgress");
			}, (error)=>{
				console.log("onError:" + error);
				reject(error);// Reject
			});
		});
	}
}

class SoundLoader{

	constructor(camera){
		console.log("FontLoader");
		this._camera = camera;
	}

	loadSounds(sounds, onSuccess, onError){
		let promises = [];
		for(let i=0; i<sounds.data.length; i++){
			let data = sounds.data[i];
			promises.push(
				this.asyncSound(data.dir, data.mp3));
		}
		Promise.all(promises).then((results)=>{
			this._sounds = results;// Sounds
			onSuccess();
		}, (error)=>{
			console.log(error);
			onError();
		});
	}

	playSound(name){
		for(let i=0; i<this._sounds.length; i++){
			if(this._sounds[i].name != name) continue;
			if(this._sounds[i].isPlaying) this._sounds[i].stop();
			this._sounds[i].play();
		}
	}

	asyncSound(dir, mp3){
		return new Promise((resolve, reject)=>{
			// AudioLoader
			let aListener = new THREE.AudioListener();
			this._camera.add(aListener);
			let sound = new THREE.PositionalAudio(aListener);
			let aLoader = new THREE.AudioLoader();
			let path = dir + mp3;
			aLoader.load(path, (buffer)=>{
				sound.setBuffer(buffer);
				sound.setRefDistance(10);
				sound.name = mp3;// Name
				resolve(sound);  // Resolve
			}, (progress)=>{
				//console.log("onProgress");
			}, (error)=>{
				console.log("onError:" + error);
				reject(error);// Reject
			});
		});
	}
}

class FontLoader{

	constructor(){
		console.log("FontLoader");
	}

	loadFonts(fonts, onSuccess, onError){
		let promises = [];
		for(let i=0; i<fonts.data.length; i++){
			let data = fonts.data[i];
			promises.push(
				this.asyncFonts(data.dir, data.font));
		}
		Promise.all(promises).then((results)=>{
			this._fonts = results;// Fonts
			onSuccess();
		}, (error)=>{
			console.log(error);
			onError();
		});
	}

	findFonts(name){
		for(let i=0; i<this._fonts.length; i++){
			if(this._fonts[i].data.familyName != name) continue;
			return this._fonts[i];
		}
		return null;
	}

	asyncFonts(dir, font){
		return new Promise((resolve, reject)=>{
			// FontLoader
			let loader = new THREE.FontLoader();
			let path = dir + font;
			loader.load(path, (result)=>{
				resolve(result);// Resolve
			}, (progress)=>{
				//console.log("onProgress");
			}, (error)=>{
				console.log("onError:" + error);
				reject(error);// Reject
			});
		});
	}

	//==========
	// Label, Text
	createLabel(str="***", className="label"){
		let div = document.createElement("div");
		div.textContent = str;
		div.className = className;
		let label = new THREE.CSS2DObject(div);
		label.position.set(0, 0, 0);
		return label;
	}

	createText(str="***", font, size=4, x=0, y=4, z=-0){
		let textGeo = new THREE.TextGeometry(str, {
			font: font, size: size, height: 2, curveSegments: 4,
			bevelThickness: 2, bevelSize: 0.2, bevelEnabled: false
		});
		textGeo.computeBoundingBox();
		textGeo.computeVertexNormals();
		let materials = [
			new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true}),
			new THREE.MeshPhongMaterial({color: 0xffffff })
		];
		let centerOffset = (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x) * 0.5;
		let textMesh = new THREE.Mesh(textGeo, materials);
		textMesh.position.x = x - centerOffset;
		textMesh.position.y = y;
		textMesh.position.z = z;
		textMesh.rotation.x = 0;
		textMesh.rotation.y = Math.PI * 2;
		return textMesh;
	}
}

class CtlVR{

	constructor(){
		console.log("Controller(VR)");

		// State
		this._state = {
			buttons: [false, false]// Touchpad, Trigger
		};

		// Listener
		this._onTouchpadPressed  = null;
		this._onTouchpadReleased = null;
		this._onTriggerPressed   = null;
		this._onTriggerReleased  = null;
	}

	setTouchpadListener(onPressed, onReleased){
		if(onPressed != null)  this._onTouchpadPressed  = onPressed;
		if(onReleased != null) this._onTouchpadReleased = onReleased;
	}

	setTriggerListener(onPressed, onReleased){
		if(onPressed != null)  this._onTriggerPressed  = onPressed;
		if(onReleased != null) this._onTriggerReleased = onReleased;
	}

	update(){
		let gamePad = navigator.getGamepads()[0];
		if(gamePad == null) return;
		//console.log("GamePad:" + gamePad.id);

		if(gamePad.axes == null || gamePad.buttons == null) return;
		let axes    = gamePad.axes;
		let buttons = gamePad.buttons;

		if(this._state.buttons[0] != buttons[0].pressed){
			this._state.buttons[0] = buttons[0].pressed;
			if(buttons[0].pressed){
				console.log("Touchpad has pressed!!");
				if(this._onTouchpadPressed) this._onTouchpadPressed(axes);
			}else{
				console.log("Touchpad has released!!");
				if(this._onTouchpadPressed) this._onTouchpadPressed(axes);
			}
		}

		if(this._state.buttons[1] != buttons[1].pressed){
			this._state.buttons[1] = buttons[1].pressed;
			if(buttons[1].pressed){
				console.log("Trigger has pressed!!");
				if(this._onTriggerPressed) this._onTriggerPressed();
			}else{
				console.log("Trigger has released!!");
				if(this._onTriggerReleased) this._onTriggerReleased();
			}
		}
	}
}