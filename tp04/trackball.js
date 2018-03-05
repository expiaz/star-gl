

/* Trackball class and method, with keyboard and mouse handling methods.
 * 
 * 
 * To use it, simply put the following in your initialiazation function:
 * 
	document.onkeydown = tbHandleKeyDown;
    document.onkeyup = tbHandleKeyUp;
	canvas.addEventListener('mousedown', tbMouseDown, true);
	canvas.addEventListener('mousemove', tbMouseMove, true);
	canvas.addEventListener('mouseup', tbMouseUp, true);	
	trackball  = new TrackBall(); 
* 
* 
* It assumes that your render method is: drawScene(). An example of this function is:
* 
	// init rendering and camera settings.
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	// ***** set viewing transformation ********
    trackball.setMatrix(mvMatrix);
	// *****************************************

 	// setup shader
 	gl.useProgram(shaderProgram);
    pointSizeUniformLocation = gl.getUniformLocation(shaderProgram, "pointSize");
    gl.uniform1f(pointSizeUniformLocation, 15.0);
	setMatrixUniforms(shaderProgram);
   
    // then draw your objects
	drawObjects();
* 
* 
* Francois Faure, Grenoble University, 2013 */

/* Modified by Romain Vergne - Grenoble University, 2015 */ 
/* 	removed keyboard events, and used mouse buttons instead to handle 
	rotations (left clic), translations (right clic) and zooms (middle clic) */


function TrackBall() {
	this.translateMat = mat4.create();
	mat4.identity(this.translateMat);
	mat4.translate(this.translateMat,[0.,0,-10.]);
	this.rotateMat = mat4.create();
	mat4.identity(this.rotateMat);
	this.mouseX;
	this.mouseY;
	this.rotating = 1;
	this.translating = 0;
	this.zooming = 0;
	this.rotationGain=1.0;
	this.translationGain=.01; 
	this.zoomGain=.01; 
}
TrackBall.prototype.setMatrix = function( tbTransform )
{
	mat4.multiply(this.translateMat, this.rotateMat, tbTransform);
}
TrackBall.prototype.setRotating = function () {
	this.rotating = 1;
	this.translating = 0;
	this.zooming = 0;
}
TrackBall.prototype.setTranslating = function () {
	this.rotating = 0;
	this.translating = 1;
	this.zooming = 0;
}
TrackBall.prototype.setZooming = function () {
	this.rotating = 0;
	this.translating = 0;
	this.zooming = 1;
}
TrackBall.prototype.startDragging = function ( mouseX, mouseY ) {
	this.mouseX = mouseX;
	this.mouseY = mouseY;
}
TrackBall.prototype.drag = function ( mouseX, mouseY ) {
	var dx = mouseX - this.mouseX;
	var dy = this.mouseY - mouseY; // mouse Y axis is downward
	this.mouseX = mouseX;
	this.mouseY = mouseY;
	
	if( this.rotating == 1 ){
	var angle = Math.sqrt( dx*dx + dy*dy ); 
	var rotation = mat4.create();
	mat4.identity(rotation);
	//console.log("dx, dy= ", dx,",",dy, "angle = ",angle);
	mat4.rotate(rotation, angle*3.14/180, [-dy,dx,0] );  // [-dy,dx,0] is perpendicular to [dx,dy,0]
	mat4.multiply( rotation, this.rotateMat, this.rotateMat ); // multiply to the left, since the rotation axis is given in world coordinates !
	}
	else if( this.translating==1 ){
		mat4.translate(this.translateMat, [
			dx * this.translationGain, 
			dy * this.translationGain, 
			0.]);
	}
	else if( this.zooming==1 ){
		mat4.translate(this.translateMat, [
			0., 
			0., 
			dy * this.zoomGain ]);		
		//console.log( mat4.str(this.translateMat));
	}
	
}
TrackBall.prototype.getTranslation = function () {
    //console.log("trackball translation = ", mat4.str(this.translateMat) ); 
    return [ this.translateMat[12],this.translateMat[13],this.translateMat[14] ];
}
TrackBall.prototype.setTranslation = function ( x,y,z ) {
    this.translateMat[12]=x;
    this.translateMat[13]=y;
    this.translateMat[14]=z;
}



/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var trackball;
var dragging = false;

function tbMouseDown(event) {
	if(event.button==0)
		trackball.setRotating();
	else if(event.button==1)
		trackball.setZooming();
	else if(event.button==2) 
		trackball.setTranslating();

	dragging = true;
	trackball.startDragging(event.clientX,event.clientY);
}

function tbMouseUp() {
	dragging = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.  */
function tbMouseMove(event) {
	if (dragging) {
		trackball.drag(event.clientX, event.clientY);
		
		drawScene();
	}
}

// function tbHandleKeyDown(event){
// 	if(String.fromCharCode(event.keyCode) == "R" ){
// 		trackball.setRotating();
// 		//console.log("set rotating");
// 	}
// 	else if(String.fromCharCode(event.keyCode) == "T" ){
// 		trackball.setTranslating();
// 		//console.log("set translating");
// 	}
// 	else if(String.fromCharCode(event.keyCode) == "Z" ){
// 		trackball.setZooming();
// 		console.log("set zooming");
// 	}
// }
// function tbHandleKeyUp(event){
// 	//console.log(String.fromCharCode(event.keyCode));
// }

