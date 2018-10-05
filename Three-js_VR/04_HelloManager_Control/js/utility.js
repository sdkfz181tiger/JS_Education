console.log("utility.js!!");

// Three.js
class ThreeManager{

	constructor(){
		console.log("ThreeManager");

		// Polyfill(for VR)
		this._polyfill = new WebVRPolyfill();

		// Scene
		this._scene = new THREE.Scene();

		// Stats
		this._stats = new Stats();
		this._stats.setMode(0);
		this._stats.domElement.style.position = "absolute";
		this._stats.domElement.style.left = "0px";
		this._stats.domElement.style.top  = "0px";
		document.body.appendChild(this._stats.domElement);

		// Axes
		this._axes = new THREE.AxisHelper(5);
		this._scene.add(this._axes);

		// Camera
		this._camera = new THREE.PerspectiveCamera(
			75, window.innerWidth/window.innerHeight, 0.1, 1000);

		// Camera(for PC)
		this._camera.position.set(0, 0, 10);// PCでポジションを移動させる場合

		// Container(for VR)
		this._cameraContainer = new THREE.Object3D();
		this._cameraContainer.add(this._camera);
		this._cameraContainer.position.set(0, 0, 0);// VRでポジションを移動させる場合
		this._cameraContainer.rotation.x = Math.PI / 10;
		this._scene.add(this._cameraContainer);

		// Light
		this._directionalLight = new THREE.DirectionalLight(0xffffff);
		this._directionalLight.position.set(0, 0.7, 0.7);
		this._scene.add(this._directionalLight);

		// Renderer
		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setSize(window.innerWidth, window.innerHeight);
		this._renderer.setClearColor(0x333333);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		//this._renderer.vr.enabled = true;// Important(for VR)
		document.body.appendChild(this._renderer.domElement);

		// Controls(for PC)
		this._controls = new THREE.TrackballControls(this._camera);// Cameraのみ対応
		this._controls.target.set(0, 0, 0);

		// Button(for VR)
		//document.body.appendChild(WEBVR.createButton(this._renderer));

		// Promises
		this._promises = [];
	}

	animate(){

		// Stats
		this._stats.update();

		// Controls(for PC)
		this._controls.update();

		// Render
		this._renderer.render(this._scene, this._camera);
	}

	//==========
	// Promise
	startPromise(assets, onSuccess, onError){

		for(let i=0; i<assets.data.length; i++){
			console.log(assets.data[i]);
			let data = assets.data[i];
			this._promises.push(
				this.asyncPromise(data.path, data.mtl, data.obj));
		}
		Promise.all(this._promises).then(onSuccess, onError);
	}

	// Promise
	asyncPromise(path, mtl, obj){
		return new Promise((resolve, reject)=>{
			// MTLLoader
			let mtlLoader = new THREE.MTLLoader();
			mtlLoader.setPath(path);
			mtlLoader.load(mtl, (materials)=>{
				console.log("onLoaded:" + mtl);
				materials.preload();
				// OBJLoader
				let objLoader = new THREE.OBJLoader();
				objLoader.setPath(path);
				objLoader.setMaterials(materials);
				objLoader.load(obj, (meshes)=>{
					meshes.children.forEach((mesh)=>{
						mesh.geometry.computeFaceNormals();
						mesh.geometry.computeVertexNormals();
					});
					meshes.scale.set(1, 1, 1);
					meshes.rotation.set(0, Math.PI, 0);
					meshes.position.set(0, 0, 0);
					resolve(meshes);// Resolve
				});
			}, (progress)=>{
				console.log("onProgress");
			}, (error)=>{
				console.log("onError:" + error);
				reject(error);// Reject
			});
		});
	}
}