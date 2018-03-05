// loads a 3D model from a json file 
// asumme that positions, normals, tex coords and indices are included
// they should be at the following places:
	// var vertices = objData.meshes[0].vertices;
	// var normals = objData.meshes[0].normals;
	// var coords = objData.meshes[0].texturecoords[0];
	// var indices = [].concat.apply([],objData.meshes[0].faces);
// change it if necessary (depends on the json exporter used, http://www.greentoken.de/onlineconv/ here)
// also assume that the shader contains 3 attribute locations (for positions, normals and coords), called:
	// shaderPgm.vertexPositionAttribute
	// shaderPgm.vertexNormalAttribute
	// shaderPgm.vertexCoordAttribute

// Romain Vergne - 2015

function Model(filename) {
	this.vertexBuffer = gl.createBuffer();
	this.vertexBuffer.itemSize = 0;
	this.vertexBuffer.numItems = 0;

	this.normalBuffer = gl.createBuffer();
	this.normalBuffer.itemSize = 0;
	this.normalBuffer.numItems = 0;

	this.coordBuffer = gl.createBuffer();
	this.coordBuffer.itemSize = 0;
	this.coordBuffer.numItems = 0;

	this.triangles = gl.createBuffer();
	this.triangles.numItems = 0;
	this.loaded = false;

	this.load(filename);
}

Model.prototype.handleLoadedObject = function(objData) {
	// les tableaux ci-dessous sont récupérés depuis le fichier chargé, puis parse
	var vertices = objData.meshes[0].vertices;
	var normals = objData.meshes[0].normals;
	var coords = objData.meshes[0].texturecoords[0];
	var indices = [].concat.apply([],objData.meshes[0].faces);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vertexBuffer.itemSize = 3;
	this.vertexBuffer.numItems = vertices.length/3;

	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	this.normalBuffer.itemSize = 3;
	this.normalBuffer.numItems = normals.length/3;

	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
	this.coordBuffer.itemSize = 2;
	this.coordBuffer.numItems = coords.length/2;

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    this.triangles.numItems = indices.length;

    this.loaded = true;
}

Model.prototype.load = function(filename) {
	var instance = this;
	var request = new XMLHttpRequest();
    request.open("GET", filename);
    request.overrideMimeType("application/json");
    request.onreadystatechange = function() {
      	if (request.readyState == 4) {
      		instance.handleLoadedObject(JSON.parse(request.responseText));
    	}
 	}
    request.send();
}

Model.prototype.draw = function( shaderPgm ) {
	if(this.loaded) {
		// active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(shaderPgm.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		// active le buffer de couleurs et fait le lien avec l'attribut aVertexColor dans le shader
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(shaderPgm.vertexNormalAttribute, this.normalBuffer.itemSize, gl.FLOAT, true, 0, 0);

		// active le buffer de couleurs et fait le lien avec l'attribut aVertexColor dans le shader
		gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
		gl.vertexAttribPointer(shaderPgm.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

		// dessine les buffers actifs
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
		gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
	}
}


