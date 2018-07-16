console.log("Hello Utility!!");

const DEG_TO_RAD = Math.PI / 180;

const PTM_RATIO  = 30.0;

const C_WIDTH  = 480;
const C_HEIGHT = 320;

const C_NAME   = "canvas";

//==========
// Box2dManager

let b2Vec2          = Box2D.Common.Math.b2Vec2;
let b2AABB          = Box2D.Collision.b2AABB;
let b2BodyDef       = Box2D.Dynamics.b2BodyDef;
let b2Body          = Box2D.Dynamics.b2Body;
let b2FixtureDef    = Box2D.Dynamics.b2FixtureDef;
let b2Fixture       = Box2D.Dynamics.b2Fixture;
let b2World         = Box2D.Dynamics.b2World;
let b2MassData      = Box2D.Collision.Shapes.b2MassData;
let b2PolygonShape  = Box2D.Collision.Shapes.b2PolygonShape;
let b2CircleShape   = Box2D.Collision.Shapes.b2CircleShape;
let b2EdgeShape     = Box2D.Collision.Shapes.b2EdgeShape;
let b2EdgeChainDef  = Box2D.Collision.Shapes.b2EdgeChainDef;
let b2DebugDraw     = Box2D.Dynamics.b2DebugDraw;

// Joint
let b2MouseJointDef     = Box2D.Dynamics.Joints.b2MouseJointDef;
let b2WeldJointDef      = Box2D.Dynamics.Joints.b2WeldJointDef;
let b2RevoluteJointDef  = Box2D.Dynamics.Joints.b2RevoluteJointDef;
let b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
let b2GearJointDef      = Box2D.Dynamics.Joints.b2GearJointDef;
let b2ContactListener   = Box2D.Dynamics.b2ContactListener;

class b2Manager{

	constructor(world){
		this._world = world;

		this._bodyDef = new b2BodyDef;
		this._fixDef  = new b2FixtureDef;
		this._fixDef.density     = 1.0;
		this._fixDef.friction    = 0.5;
		this._fixDef.restitution = 0.2;

		this._destroys = [];

		this._camera  = null;
		this._cameraX = 0;
		this._cameraY = 0;
		this._focusP  = 100;
		this._focusL  = this._focusP;
		this._focusR  = C_WIDTH - this._focusP;
		this._focusT  = this._focusP;
		this._focusB  = C_HEIGHT - this._focusP;

		this.init();
	}

	init(){

		// CanvasPosition
		canvasPosition = getElementPosition(document.getElementById(C_NAME));

		// Create ground
		this._bodyDef.type = b2Body.b2_staticBody;
		this._fixDef.shape = new b2PolygonShape;

		// Bottom, Top
		// this._fixDef.shape.SetAsBox(C_WIDTH / PTM_RATIO / 2, 0.2);
		// this._bodyDef.position.Set(C_WIDTH / PTM_RATIO / 2, C_HEIGHT / PTM_RATIO);
		// this._world.CreateBody(this._bodyDef).CreateFixture(this._fixDef);
		// this._bodyDef.position.Set(C_WIDTH / PTM_RATIO / 2, 0);
		// this._world.CreateBody(this._bodyDef).CreateFixture(this._fixDef);

		// Left, Right
		// this._fixDef.shape.SetAsBox(0.2, C_HEIGHT / PTM_RATIO / 2);
		// this._bodyDef.position.Set(0, C_HEIGHT / PTM_RATIO / 2);
		// this._world.CreateBody(this._bodyDef).CreateFixture(this._fixDef);
		// this._bodyDef.position.Set(C_WIDTH / PTM_RATIO, C_HEIGHT / PTM_RATIO / 2);
		// this._world.CreateBody(this._bodyDef).CreateFixture(this._fixDef);

		// DebugDraw
		this._debugDraw = new b2DebugDraw();
		this._debugDraw.SetSprite(document.getElementById(C_NAME).getContext("2d"));
		this._debugDraw.SetDrawScale(PTM_RATIO);
		this._debugDraw.SetFillAlpha(0.5);
		this._debugDraw.SetLineThickness(1.0);
		this._debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		this._world.SetDebugDraw(this._debugDraw);
	}

	createCamera(type, x, y, w, h, deg=0){

		// Box
		this._bodyDef.position.Set(x / PTM_RATIO, y / PTM_RATIO);
		this._bodyDef.angle = deg * DEG_TO_RAD;
		this._bodyDef.type = type;
		this._bodyDef.userData = null;

		// Shape
		this._fixDef.shape = new b2PolygonShape;
		this._fixDef.shape.SetAsBox(w / PTM_RATIO / 2, h / PTM_RATIO / 2);
		this._fixDef.filter.maskBits = 0x0000;// Collision false
		let body = this._world.CreateBody(this._bodyDef);
		body.CreateFixture(this._fixDef);
		return body;
	}

	createBox(type, x, y, w, h, deg=0){

		// Box
		this._bodyDef.position.Set(x / PTM_RATIO, y / PTM_RATIO);
		this._bodyDef.angle = deg * DEG_TO_RAD;
		this._bodyDef.type = type;
		this._bodyDef.userData = null;

		// Shape
		this._fixDef.shape = new b2PolygonShape;
		this._fixDef.shape.SetAsBox(w / PTM_RATIO / 2, h / PTM_RATIO / 2);
		this._fixDef.density = 3.0;
		this._fixDef.friction = 3.0;
		this._fixDef.filter.maskBits = 0xffff;// Collision true
		let body = this._world.CreateBody(this._bodyDef);
		body.CreateFixture(this._fixDef);
		return body;
	}

	createBoxImage(type, x, y, img, deg=0){

		// Box
		this._bodyDef.position.Set(x / PTM_RATIO, y / PTM_RATIO);
		this._bodyDef.angle = deg * DEG_TO_RAD;
		this._bodyDef.type = type;
		this._bodyDef.userData = null;

		let w = img.width;
		let h = img.height;
		this._bodyDef.userData = {shape_type: "box", img: img, width: w, height: h};
		this._fixDef.shape = new b2PolygonShape;
		this._fixDef.shape.SetAsBox(w / PTM_RATIO / 2, h / PTM_RATIO / 2);
		this._fixDef.filter.maskBits = 0xffff;// Collision true
		let body = this._world.CreateBody(this._bodyDef);
		body.CreateFixture(this._fixDef);
		return body;
	}

	createCircle(type, x, y, w, deg=0){

		// Box
		this._bodyDef.position.Set(x / PTM_RATIO, y / PTM_RATIO);
		this._bodyDef.angle = deg * DEG_TO_RAD;
		this._bodyDef.type = type;
		this._bodyDef.userData = null;

		// Shape
		this._fixDef.shape = new b2CircleShape(w / PTM_RATIO);
		this._fixDef.filter.maskBits = 0xffff;// Collision true
		let body = this._world.CreateBody(this._bodyDef);
		body.CreateFixture(this._fixDef);
		return body;
	}

	createCircleImage(type, x, y, img, deg=0){

		// Box
		this._bodyDef.position.Set(x / PTM_RATIO, y / PTM_RATIO);
		this._bodyDef.angle = deg * DEG_TO_RAD;
		this._bodyDef.type = type;
		this._bodyDef.userData = null;

		let w = img.width;
		let h = img.height;
		let radius = ((w < h) ? w : h) / 2;
		this._bodyDef.userData = {shape_type: "circle", img: img, radius: radius};
		this._fixDef.shape = new b2CircleShape(radius / PTM_RATIO);
		this._fixDef.filter.maskBits = 0xffff;// Collision true
		let body = this._world.CreateBody(this._bodyDef);
		body.CreateFixture(this._fixDef);
		return body;
	}

	createPolygon(type, x, y, points, deg=0){

		// Polygon
		this._bodyDef.position.Set(x / PTM_RATIO, y / PTM_RATIO);
		this._bodyDef.angle = deg * DEG_TO_RAD;
		this._bodyDef.type = type;
		this._bodyDef.userData = null;

		// Vertices
		let vertices = [];
		for(let point of points){
			let vector = new b2Vec2(point.x / PTM_RATIO, point.y / PTM_RATIO);
			vertices.push(vector);
		}

		// Shape
		this._fixDef.shape = new b2PolygonShape;
		this._fixDef.shape.SetAsVector(vertices, vertices.length);
		this._fixDef.filter.maskBits = 0xffff;// Collision true

		let body = this._world.CreateBody(this._bodyDef);
		body.CreateFixture(this._fixDef);
		return body;
	}

	createEdge(type, x, y, posA, posB, deg=0){

		// Polygon
		this._bodyDef.position.Set(x / PTM_RATIO, y / PTM_RATIO);
		this._bodyDef.angle = deg * DEG_TO_RAD;
		this._bodyDef.type = type;
		this._bodyDef.userData = null;

		// Vertices
		let vecA = new b2Vec2(posA.x / PTM_RATIO, posA.y / PTM_RATIO);
		let vecB = new b2Vec2(posB.x / PTM_RATIO, posB.y / PTM_RATIO);

		// Shape
		this._fixDef.shape = new b2PolygonShape;// b2EdgeShape ?
		this._fixDef.shape.SetAsEdge(vecA, vecB);
		this._fixDef.filter.maskBits = 0xffff;// Collision true

		let body = this._world.CreateBody(this._bodyDef);
		body.CreateFixture(this._fixDef);
		return body;
	}

	createWeldJoint(bodyA, bodyB, aX, aY){
		let weldJointDef = new b2WeldJointDef();
		let anchor = new b2Vec2(aX/PTM_RATIO, aY/PTM_RATIO);
		weldJointDef.Initialize(bodyA, bodyB, anchor);
		let weldJoint = this._world.CreateJoint(weldJointDef);
		//world.DestroyJoint(weldJoint);
		return weldJoint;
	}

	createRevoluteJoint(bodyA, bodyB, aX, aY, lowerAngle, upperAngle){
		let revJointDef = new b2RevoluteJointDef();
		let anchor = new b2Vec2(aX/PTM_RATIO, aY/PTM_RATIO);
		revJointDef.Initialize(bodyA, bodyB, anchor);
		revJointDef.lowerAngle  = lowerAngle * DEG_TO_RAD; // 可動範囲の最小値
		revJointDef.upperAngle  = upperAngle * DEG_TO_RAD; // 可動範囲の最大値
		revJointDef.enableLimit = true; // 可動範囲を可動有効化
		let revoluteJoint = this._world.CreateJoint(revJointDef);
		return revoluteJoint;
	}

	createTorqueJoint(bodyA, bodyB, aX, aY, torque, speed){
		let revJointDef = new b2RevoluteJointDef();
		let anchor = new b2Vec2(aX/PTM_RATIO, aY/PTM_RATIO);
		revJointDef.Initialize(bodyA, bodyB, anchor);
		revJointDef.maxMotorTorque = torque;// トルク力
		revJointDef.motorSpeed = speed; // 回転速度
		revJointDef.enableMotor = true; // モーターを有効化
		let revoluteJoint = this._world.CreateJoint(revJointDef);
		return revoluteJoint;
	}

	createRotateJoint(bodyA, bodyB, aX, aY){
		let revJointDef = new b2RevoluteJointDef();
		let anchor = new b2Vec2(aX/PTM_RATIO, aY/PTM_RATIO);
		revJointDef.Initialize(bodyA, bodyB, anchor);
		let revoluteJoint = this._world.CreateJoint(revJointDef);
		return revoluteJoint;
	}

	createPrismaticJoint(bodyA, bodyB, aX, aY, axisX, axisY, lowerTranslation, upperTranslation){
		var prisJointDef = new b2PrismaticJointDef();
		let anchor = new b2Vec2(aX/PTM_RATIO, aY/PTM_RATIO);
		let axis = new b2Vec2(axisX, axisY);
		prisJointDef.Initialize(bodyA, bodyB, anchor, axis);
		prisJointDef.lowerTranslation = lowerTranslation/PTM_RATIO;
		prisJointDef.upperTranslation = upperTranslation/PTM_RATIO;
		prisJointDef.enableLimit = true;
		let prismaticJoint = this._world.CreateJoint(prisJointDef);
		return prismaticJoint;
	}

	createGearJoint(bodyA, bodyB, jointA, jointB){
		var gearJointDef = new b2GearJointDef();
		gearJointDef.bodyA = bodyA;
		gearJointDef.bodyB = bodyB;
		gearJointDef.joint1 = jointA;
		gearJointDef.joint2 = jointB;
		gearJointDef.ratio = 1;
		let gearJoint = this._world.CreateJoint(gearJointDef);
		return gearJoint;
	}

	pushDestroys(body){
		this._destroys.push(body);
	}

	setCamera(camera){
		this._camera = camera;
	}

	update(){
		/*
		// Mouse
		if(isMouseDown && (!mouseJoint)){
			let body = getBodyAtMouse();
			if(body){
				let md = new b2MouseJointDef();
				md.bodyA = world.GetGroundBody();
				md.bodyB = body;
				md.target.Set(mouseX, mouseY);
				md.collideConnected = true;
				md.maxForce = 300.0 * body.GetMass();
				mouseJoint = world.CreateJoint(md);
				body.SetAwake(true);
		   }
		}
		
		if(mouseJoint){
			if(isMouseDown){
				mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
			}else{
				world.DestroyJoint(mouseJoint);
				mouseJoint = null;
			}
		}
		*/

		// Step
		this._world.Step(1 / 30, 10, 10);
		this._world.ClearForces();
		//this._world.DrawDebugData();

		// Destroy
		for(let destroy of this._destroys){
			this._world.DestroyBody(destroy);
		}
		this._destroys = [];

		// Offset
		if(this._camera != null){
			let posX = this._camera.GetPosition().x * PTM_RATIO;
			if(this._focusR < posX){
				let distance   = posX - this._focusR;
				this._cameraX += distance;
				this._focusR  += distance;
				this._focusL  += distance;
			}
			if(posX < this._focusL){
				let distance   = this._focusL - posX;
				this._cameraX -= distance;
				this._focusR  -= distance;
				this._focusL  -= distance;
			}

			let posY = this._camera.GetPosition().y * PTM_RATIO;
			if(this._focusB < posY){
				let distance   = posY - this._focusB;
				this._cameraY += distance;
				this._focusB  += distance;
				this._focusT  += distance;
			}
			if(posY < this._focusT){
				let distance   = this._focusT - posY;
				this._cameraY -= distance;
				this._focusB  -= distance;
				this._focusT  -= distance;
			}

			// For mouse
			canvasCameraX = this._cameraX;
			canvasCameraY = this._cameraY;
		}

		// DebugDraw
		let context = this._debugDraw.GetSprite();
		context.save();
		context.translate(-this._cameraX, -this._cameraY);
		context.clearRect(this._cameraX, this._cameraY, C_WIDTH, C_HEIGHT);
		this._world.DrawDebugData();
		context.restore();

		// Images
		for(let body = this._world.GetBodyList(); body; body = body.GetNext()){
			if(body.GetType() == b2Body.b2_dynamicBody){
				let position = body.GetPosition();
				let userData = body.GetUserData();
				context.save();
				// Images
				if(userData && userData.img && userData.img.complete){
					if(userData.shape_type && userData.shape_type == "box"){
						let slideX = position.x * PTM_RATIO - this._cameraX;
						let slideY = position.y * PTM_RATIO - this._cameraY;
						context.translate(slideX, slideY);
						context.rotate(body.GetAngle());
						context.drawImage(userData.img, -userData.width / 2.0, -userData.height / 2.0);
					}
					if(userData.shape_type && userData.shape_type == "circle"){
						let slideX = position.x * PTM_RATIO - this._cameraX;
						let slideY = position.y * PTM_RATIO - this._cameraY;
						context.translate(slideX, slideY);
						context.rotate(body.GetAngle());
						context.drawImage(userData.img, -userData.img.width/2, -userData.img.height/2);
					}
				}
				context.restore();
			}
		}
	}
}

//==========
// Mouse
let mouseX, mouseY, mousePVec, isMouseDown;
let selectedBody, mouseJoint;
let canvasPosition;
let canvasCameraX, canvasCameraY;

function handleMouseDown(e){
	isMouseDown = true;
	handleMouseMove(e);
	document.addEventListener("mousemove", handleMouseMove, true);
	document.addEventListener("touchmove", handleMouseMove, true);
}
document.addEventListener("mousedown", handleMouseDown, true);
document.addEventListener("touchstart", handleMouseDown, true);

function handleMouseUp(){
	document.removeEventListener("mousemove", handleMouseMove, true);
	document.removeEventListener("touchmove", handleMouseMove, true);
	isMouseDown = false;
	mouseX = undefined;
	mouseY = undefined;
}
document.addEventListener("mouseup", handleMouseUp, true);
document.addEventListener("touchend", handleMouseUp, true);

function handleMouseMove(e){
	let clientX, clientY;
	if(e.clientX && e.clientY){
		clientX = e.clientX + canvasCameraX; 
		clientY = e.clientY + canvasCameraY;
	}else if(e.changedTouches && e.changedTouches.length > 0){
		let touch = e.changedTouches[e.changedTouches.length - 1];
		clientX = touch.clientX;
		clientY = touch.clientY;
	}else{
	   return;
	}
	mouseX = (clientX - canvasPosition.x) / PTM_RATIO;
	mouseY = (clientY - canvasPosition.y) / PTM_RATIO;
	e.preventDefault();
};

//==========
// Get body
function getBodyAtMouse(){
	mousePVec = new b2Vec2(mouseX, mouseY);
	let aabb = new b2AABB();
	aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
	aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
	
	// Query the world for overlapping shapes.
	selectedBody = null;
	world.QueryAABB(getBodyCB, aabb);
	return selectedBody;
}

function getBodyCB(fixture){
	if(fixture.GetBody().GetType() != b2Body.b2_staticBody){
		if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)){
			selectedBody = fixture.GetBody();
			return false;
		}
	}
	return true;
}

//==========
// Utility
function getElementPosition(element){
	let elem = element;
	let tagName = "", x = 0, y = 0;
	while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")){
		y += elem.offsetTop; x += elem.offsetLeft;
		tagName = elem.tagName.toUpperCase();
		if(tagName == "BODY") elem=0;
		if(typeof(elem) == "object"){
			if(typeof(elem.offsetParent) == "object") elem = elem.offsetParent;
		}
	}
	return {x: x, y: y};
 }