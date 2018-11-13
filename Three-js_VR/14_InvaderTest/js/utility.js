console.log("utility.js!!");

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Three.js
class ThreeManager{

	constructor(pcX=0, pcY=0, pcZ=0, vrX=0, vrY=0, vrZ=0){
		console.log("ThreeManager");

		// PC or VR
		//   false: PC mode(default)
		//   true:  VR mode
		this._modeVR = false;
		if(0 < navigator.activeVRDisplays.length){
			this._modeVR = true;
		}

		// Polyfill(for VR)
		this._polyfill = new WebVRPolyfill();

		// Scene
		this._scene = new THREE.Scene();

		// Stats
		this._stats = new Stats();
		this._stats.setMode(0);
		this._stats.domElement.style.position = "absolute";
		this._stats.domElement.style.left     = "0px";
		this._stats.domElement.style.top      = "0px";
		document.body.appendChild(this._stats.domElement);

		// Axes
		this._axes = new THREE.AxesHelper(5);
		this._scene.add(this._axes);

		// Camera
		this._camera = new THREE.PerspectiveCamera(
			75, window.innerWidth/window.innerHeight, 0.1, 1000);

		// Container(for VR)
		this._cameraContainer = new THREE.Object3D();
		this._cameraContainer.add(this._camera);
		this._scene.add(this._cameraContainer);

		// PC or VR
		if(this._modeVR == false){
			// Camera
			this._camera.position.set(pcX, pcY, pcZ);// PCでポジションを移動させる場合
			this._cameraContainer.rotation.set(0*DEG_TO_RAD, 0*DEG_TO_RAD, 0*DEG_TO_RAD);
			// Controls
			this._controls = new THREE.TrackballControls(this._camera);// Cameraのみ対応
			this._controls.target.set(0, 0, 0);
		}else{
			// CameraContainer
			this._cameraContainer.position.set(vrX, vrY, vrZ);// VRでポジションを移動させる場合
			this._cameraContainer.rotation.set(0*DEG_TO_RAD, 0*DEG_TO_RAD, 0*DEG_TO_RAD);
		}

		// HemiLight
		this._hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		this._hemiLight.position.set(0, 30, 0);
		this._hemiLight.color.setHSL(0.7, 0.9, 0.7);
		this._hemiLight.groundColor.setHSL(1, 1, 1);
		this._scene.add(this._hemiLight);
		this._hemiLightHelper = new THREE.HemisphereLightHelper(this._hemiLight, 10);
		this._scene.add(this._hemiLightHelper);

		// Light
		this._dirLight = new THREE.DirectionalLight(0xffffff);
		this._dirLight.position.set(-20.0, 20.0, 20.0);
		this._scene.add(this._dirLight);
		this._dirLightHelper = new THREE.DirectionalLightHelper(this._dirLight, 5);
		this._scene.add(this._dirLightHelper);

		// Renderer
		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._renderer.setClearColor(0x666666);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.vr.enabled = this._modeVR;// Important(for VR)
		document.body.appendChild(this._renderer.domElement);

		// CSS2DRenderer
		this._cssRenderer = new THREE.CSS2DRenderer();
		this._cssRenderer.setSize(window.innerWidth, window.innerHeight);
		this._cssRenderer.domElement.style.position = "absolute";
		this._cssRenderer.domElement.style.top = 0;
		document.body.appendChild(this._cssRenderer.domElement);

		// Button
		document.body.appendChild(WEBVR.createButton(this._renderer));

		// Wire
		this.createWire(30, 30, 2, {color: 0x999999});

		// Group
		this._group = new THREE.Group();
		this._scene.add(this._group);

		// Raycaster
		let tempMatrix = new THREE.Matrix4();
		let raycaster  = new THREE.Raycaster();
		let targets    = this._group;

		this._ctl1 = this._renderer.vr.getController(0);
		this._ctl1.addEventListener("selectstart", onSelectStart);
		this._ctl1.addEventListener("selectend",   onSelectEnd);
		this._cameraContainer.add(this._ctl1);
		this._ctl2 = this._renderer.vr.getController(1);
		this._ctl2.addEventListener("selectstart", onSelectStart);
		this._ctl2.addEventListener("selectend",   onSelectEnd);
		this._cameraContainer.add(this._ctl2);

		// Line
		let geometry = new THREE.BufferGeometry().setFromPoints(
			[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
		let line = new THREE.Line(geometry);
		line.name = "line";
		line.scale.z = 20;// Length of line
		this._ctl1.add(line.clone());
		this._ctl2.add(line.clone());

		// Assets, Sounds, Fonts
		this._assets = [];
		this._sounds = [];
		this._fonts  = [];

		function onSelectStart(event){
			console.log("onSelectStart");
			let target = event.target;
			tempMatrix.identity().extractRotation(target.matrixWorld);
			raycaster.ray.origin.setFromMatrixPosition(target.matrixWorld);
			raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
			let intersections = raycaster.intersectObjects(targets.children, true);
			if(0 < intersections.length){
				console.log("I captured:" + intersections.length);
				console.log(intersections[0]);
			}
		}

		function onSelectEnd(event){
			console.log("onSelectEnd");
		}
	}

	update(){

		// Stats
		this._stats.update();

		// Controls(for PC)
		if(this._modeVR == false) this._controls.update();

		// Render
		this._renderer.render(this._scene, this._camera);

		// CSS2DRenderer
		this._cssRenderer.render(this._scene, this._camera);
	}

	getCamera(){
		return this._camera;
	}

	getCameraContainer(){
		return this._cameraContainer;
	}

	addScene(mesh){
		this._scene.add(mesh);
	}

	addGroup(mesh){
		this._group.add(mesh);
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
	// Label, Text
	createLabel(str="***", className="label"){
		let div = document.createElement("div");
		div.textContent = str;
		div.className = className;
		let label = new THREE.CSS2DObject(div);
		label.position.set(0, 0, 0);
		return label;
	}

	createText(str="***", font){
		let textGeo = new THREE.TextGeometry(str, {
			font: font, size: 8, height: 2, curveSegments: 4,
			bevelThickness: 2, bevelSize: 0.2, bevelEnabled: false
		});
		textGeo.computeBoundingBox();
		textGeo.computeVertexNormals();
		let materials = [
			new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true}),
			new THREE.MeshPhongMaterial({color: 0xffffff })
		];
		let centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
		let textMesh = new THREE.Mesh(textGeo, materials);
		textMesh.position.x = centerOffset;
		textMesh.position.y = 8;
		textMesh.position.z = -10;
		textMesh.rotation.x = 0;
		textMesh.rotation.y = Math.PI * 2;
		return textMesh;
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

	//==========
	// Assets
	loadAssets(assets, onSuccess, onError){
		this._assets = assets;// Assets
		let promises = [];
		for(let i=0; i<assets.data.length; i++){
			let data = assets.data[i];
			promises.push(
				this.asyncAsset(data.dir, data.mtl, data.obj));
		}
		Promise.all(promises).then(onSuccess, onError);
	}

	findAssets(dir, fileName){
		for(let i=0; i<this._assets.data.length; i++){
			let asset = this._assets.data[i];
			let pMtl = dir + fileName;
			let pObj = dir + fileName;
			let aMtl = asset.dir + asset.mtl;
			let aObj = asset.dir + asset.obj;
			if(pMtl == aMtl || pObj == aObj) return i;
		}
		return -1;
	}

	asyncAsset(dir, mtl, obj){
		return new Promise((resolve, reject)=>{
			// MTLLoader
			let mtlLoader = new THREE.MTLLoader();
			mtlLoader.setPath(dir);
			mtlLoader.load(mtl, (materials)=>{
				//console.log("onLoaded:" + mtl);
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
					meshes.scale.set(1, 1, 1);
					meshes.rotation.set(0, Math.PI, 0);
					meshes.position.set(0, 0, 0);
					meshes.name = mtl;// Name
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

	//==========
	// Sounds
	loadSounds(sounds, onSuccess, onError){
		this._sounds = sounds;// Sounds
		let promises = [];
		for(let i=0; i<sounds.data.length; i++){
			let data = sounds.data[i];
			promises.push(
				this.asyncSound(data.dir, data.mp3));
		}
		Promise.all(promises).then(onSuccess, onError);
	}

	findSounds(dir, fileName){
		for(let i=0; i<this._sounds.data.length; i++){
			let sound = this._sounds.data[i];
			let path = dir + fileName;
			let file = sound.dir + sound.mp3;
			if(path == file) return i;
		}
		return -1;
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
				//console.log("onLoaded:" + mp3);
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

	//==========
	// Faces
	loadFaces(faces, onSuccess, onError){
		this._faces = faces;// Faces
		let promises = [];
		for(let i=0; i<faces.data.length; i++){
			let data = faces.data[i];
			promises.push(
				this.asyncFaces(data.dir, data.face));
		}
		Promise.all(promises).then(onSuccess, onError);
	}

	findFaces(dir, fileName){
		for(let i=0; i<this._faces.data.length; i++){
			let sound = this._faces.data[i];
			let path = dir + fileName;
			let file = sound.dir + sound.face;
			if(path == file) return i;
		}
		return -1;
	}

	asyncFaces(dir, face){
		return new Promise((resolve, reject)=>{
			// FontLoader
			let loader = new THREE.FontLoader();
			let path = dir + face;
			loader.load(path, (font)=>{
				//console.log(face.data.familyName);
				resolve(font);// Resolve
			}, (progress)=>{
				//console.log("onProgress");
			}, (error)=>{
				console.log("onError:" + error);
				reject(error);// Reject
			});
		});
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