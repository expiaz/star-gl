
function CubeFaces8 () {
	// cree un nouveau buffer sur le GPU et l'active
	this.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer );

	// un tableau contenant les positions des sommets (sur CPU donc)
	var vertices = [
		-1.0,-1.0,-1.0, //a'
		 1.0,-1.0,-1.0, //b'
		 1.0, 1.0,-1.0, //c'
		-1.0, 1.0,-1.0, //d'

		-1.0,-1.0, 1.0, //a
		 1.0,-1.0, 1.0, //b
		 1.0, 1.0, 1.0, //c
		-1.0, 1.0, 1.0  //d
	];

	// on envoie ces positions au GPU ici (et on se rappelle de leur nombre/taille)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vertexBuffer.itemSize = 3;
	this.vertexBuffer.numItems = 8;

	// créer un buffer de couleurs sur le GPU et l'active
	this.colorsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
	var color = [
		1.0, 0.5, 0, 1.0, //a'
		0.0, 1.0, 0.5, 1.0, //b'
		0.5, 0.0, 1.0, 1.0, //c'
		0.33, 0.66, 1.0, 1.0, //d'
		1.0, 0.33, 0.66, 1.0, //a
		0.66, 1.0, 0.33, 1.0, //b
		0.0, 0.25, 0.75, 1.0, //c
		0.75, 0.0, 0.25, 1.0, //d
	];
	// envoi les couleurs du CPU vers le GPU
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
	this.colorsBuffer.itemSize = 4;
	this.colorsBuffer.numItems = 8;

	// creation des faces du cube (les triangles) avec les indices vers les sommets
	this.triangles = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	var tri = [
		0,2,1, 0,3,2,  // Z-
		0,1,5, 0,5,4,  // Y-
		1,2,6, 1,6,5,  // X+
		2,7,6, 2,3,7,  // Y+
		3,4,7, 3,0,4,  // X-
		4,5,6, 4,6,7   // Z+
		];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
    this.triangles.numItems = 36;
}

CubeFaces8.prototype.draw = function( shaderPgm ) {
	// active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(shaderPgm.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// active le buffer de couleurs et fait le lien avec l'attribut aVertexColor dans le shader
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
	gl.vertexAttribPointer(shaderPgm.vertexColorAttribute, this.colorsBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// dessine les buffers actifs
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	gl.drawElements(gl.TRIANGLES /*gl.POINTS*/, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
}


