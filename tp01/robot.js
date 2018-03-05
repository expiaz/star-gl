/**
 * @var {WebGLRenderingContext} gl
 */
var gl;
var xRot = 0;
var yRot = 0;

/*----------------------------------------------------------------------
 * Initialisation du canvas
 *---------------------------------------------------------------------*/
function initGL(canvas) {
	try {
		// 'experimental-webgl' est utilise depuis la phase de developpement de
		// la specification de webGL il devrait etre remplace par 'webgl' un jour
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function drawRobot() {
    // corps
    creerBoite(3/3, 4/3, 2/3);
    // tête
    mvPushMatrix();
    mat4.translate(mvMatrix, [0/3, 3/3, 0/3]);
    creerBoite(2/3, 2/3, 2/3);
    mvPopMatrix();
    // jambe gauche
    mvPushMatrix();
    mat4.translate(mvMatrix, [-1/3, -4/3, 0/3]);
    creerBoite(1/3, 4/3, 2/3);
    mvPopMatrix();
    // jambe droite
    mvPushMatrix();
    mat4.translate(mvMatrix, [1/3, -4/3, 0/3]);
    creerBoite(1/3, 4/3, 2/3);
    mvPopMatrix();
    // bras gauche
    mvPushMatrix();
    mat4.translate(mvMatrix, [-2/3, 0.5/3, 0/3]);
    creerBoite(1/3, 3/3, 2/3);
    mat4.translate(mvMatrix, [0/3, -3/3, 0/3]);
    creerBoite(1/3, 3/3, 2/3);
    mvPopMatrix();
    // bras droit
    mvPushMatrix();
    mat4.translate(mvMatrix, [2/3, 0.5/3, 0/3]);
    creerBoite(1/3, 3/3, 2/3);
    mat4.translate(mvMatrix, [0/3, -3/3, 0/3]);
    creerBoite(1/3, 3/3, 2/3);
    mvPopMatrix();

}

/*----------------------------------------------------------------------
 * Affichage de la scene 
 *---------------------------------------------------------------------*/
function drawScene() {
	/* dimensions du viewport */
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

	/* efface les buffers de couleurs et de profondeur */
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	/* on choisit l'angle de vue et les dimensions de la scene */
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	/* on initialise la matrice */
	mat4.identity(mvMatrix);

	/* on choisit le point de vue */
	mat4.translate(mvMatrix, [0.0, 0.0, -10.0]);

	/* applique les rotations issues de l'action de la souris */
 	mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);
  	mat4.rotate(mvMatrix, degToRad(xRot), [1, 0, 0]);

	/* decommenter pour afficher le repere */
	// afficherRepere() 

    /* placez votre code de dessin du robot ici */
    afficherRepere();

    var lines = -1;
    while(lines < 100) {
        var columns = ++lines;
        for (var i = -columns; i <= columns; i++) {
            mvPushMatrix();
            mat4.translate(mvMatrix, [i * 2, 0, - Math.abs(lines) * 2]);
            drawRobot();
            mvPopMatrix();
        }
    }


}

function webGLStart() {
	var canvas = document.getElementById("robot-canvas");
	initGL(canvas); // Initialise le context GL
	initShaders(); // initialise les vertex et fragment shaders
	initBuffers(); // initialise les buffers de géométrie

	gl.clearColor(0.0, 0.0, 0.0, 1.0); // Specifie les valeurs de couleurs lorsque le buffer de couleur est efface.
	gl.clearDepth(1.0);				   // Specifie la valeur a utilisr lorsque le buffer de profondeur est efface.
	gl.enable(gl.DEPTH_TEST);		   // Active le test de profondeur.
	gl.depthFunc(gl.LEQUAL);		   // Les objets proches assombrissent les objets lointains.

	/* Pour l'interaction avec la souris. Recupere les evenements d'actions sur la
	 * souris et appelle les fonctions correspondantes. */
	canvas.addEventListener('mousedown', mouseDown, true);
	canvas.addEventListener('mousemove', mouseMove, true);
	canvas.addEventListener('mouseup', mouseUp, true);
	
	/* Pour les interactions avec le clavier.
	 *  document.onkeydown = ...
	 */

	drawScene();
}

/*----------------------------------------------------------------------
 * Gestion des evenements de la souris
 *---------------------------------------------------------------------*/
var lastX;
var lastY;
var dragging = false;

function mouseDown(event) {
	lastX = event.clientX;
	lastY = event.clientY;
	dragging = true;
}

function mouseUp() {
	dragging = false;
}

/* Lorsque la souris est tenue cliquee, on rend de nouveau la scene en
 * incrementant progressivement les angles au fur et a mesure. */
function mouseMove(event) {
	if (dragging) {
		yRot += (event.clientX - lastX) / 5.0;
		xRot += (event.clientY - lastY) / 5.0;

		lastX = event.clientX;
		lastY = event.clientY;
		drawScene();
	}
}


/*----------------------------------------------------------------------
 * Matrix utility functions
 *---------------------------------------------------------------------*/
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}