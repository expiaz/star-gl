function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

var boxVertexPositionBuffer;
var axeVertexPositionBuffer;

/* initialise un Buffer contenant des sommets.
 * Ce buffera pourra etre appele et modifie plusieurs fois pour etre rendu dans
 * la scene. */
function initBuffers() {
	boxVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexPositionBuffer);
	var vertices = [
		// A - B
		-0.5, -0.5,  0.5,
		0.5, -0.5,  0.5,

		// A - E
		-0.5, -0.5, 0.5,
		-0.5, 0.5, 0.5,

		// A - D
		-0.5, -0.5, 0.5,
		-0.5, -0.5, -0.5,

		// B - F
		0.5, -0.5, 0.5,
		0.5, 0.5, 0.5,

		// B - C
		0.5, -0.5, 0.5,
		0.5, -0.5, -0.5,

		// C - D
		0.5, -0.5, -0.5,
		-0.5, -0.5, -0.5,

		// C - G
		0.5, -0.5, -0.5,
		0.5, 0.5, -0.5,

		// F - E
		0.5, 0.5, 0.5,
		-0.5, 0.5, 0.5,

		// F - G
		0.5, 0.5, 0.5,
		0.5, 0.5, -0.5,

		// H - D
		-0.5, 0.5, -0.5,
		-0.5, -0.5, -0.5,

		// H - G
		-0.5, 0.5, -0.5,
		0.5, 0.5, -0.5,

		// H - E
		-0.5, 0.5, -0.5,
		-0.5, 0.5, 0.5
    ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	boxVertexPositionBuffer.itemSize = 3;
	boxVertexPositionBuffer.numItems = 24;

	axeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, axeVertexPositionBuffer);
	vertices = [
		0.0, 0.0, 0.0,
		1.0, 0.0, 0.0,

		0.0, 0.0, 0.0,
		0.0, 1.0, 0.0,

		0.0, 0.0, 0.0,
		0.0, 0.0, 1.0
			];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	axeVertexPositionBuffer.itemSize = 3;
	axeVertexPositionBuffer.numItems = 6;
}

/* Creee une boite parametrable en utilisant le buffer boxVertexPositionBuffer.
 * */
function creerBoite(x, y, z)
{
	mvPushMatrix();
	mat4.scale(mvMatrix, [x, y, z]);
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAtribute, boxVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.LINES, 0, boxVertexPositionBuffer.numItems);
	mvPopMatrix();
}

/* Affiche le repere */
function afficherRepere()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, axeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, axeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.LINES, 0, axeVertexPositionBuffer.numItems);
}

/*----------------------------------------------------------------------
 * Matrix utility functions
 *---------------------------------------------------------------------*/

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}


