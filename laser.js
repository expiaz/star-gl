var LaserShader;

function initLaserShader() {
	LaserShader = initShaders("laser-vs","laser-fs");

    // active ce shader
    gl.useProgram(LaserShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    LaserShader.vertexPositionAttribute = gl.getAttribLocation(LaserShader, "aVertexPosition");
    gl.enableVertexAttribArray(LaserShader.vertexPositionAttribute); // active cet attribut

    // pareil pour les coordonnees de texture
    LaserShader.vertexCoordAttribute = gl.getAttribLocation(LaserShader, "aVertexCoord");
    gl.enableVertexAttribArray(LaserShader.vertexCoordAttribute);

     // adresse de la variable uniforme uOffset dans le shader
    LaserShader.positionUniform = gl.getUniformLocation(LaserShader, "uPosition");
    LaserShader.maTextureUniform = gl.getUniformLocation(LaserShader, "uMaTexture");
}

function Laser(position) {
	this.initParameters();

	// cree un nouveau buffer sur le GPU et l'active
	this.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

	// un tableau contenant les positions des sommets (sur CPU donc)
	var wo2 = 0.5*this.width;
	var ho2 = 0.5*this.height;

	var vertices = [
		-wo2,-ho2, -0.5,
		 wo2,-ho2, -0.5,
		 wo2, ho2, -0.5,
		-wo2, ho2, -0.5
	];

	// on envoie ces positions au GPU ici (et on se rappelle de leur nombre/taille)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vertexBuffer.itemSize = 3;
	this.vertexBuffer.numItems = 4;

	// meme principe pour les couleurs
	this.coordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
	var coords = [
		 0.0, 0.0,
		 1.0, 0.0,
		 1.0, 1.0,
		 0.0, 1.0
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
	this.coordBuffer.itemSize = 2;
	this.coordBuffer.numItems = 4;

	// creation des faces du cube (les triangles) avec les indices vers les sommets
	this.triangles = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	var tri = [0,1,2,0,2,3];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
    this.triangles.numItems = 6;


}

Laser.prototype.initParameters = function() {
	this.width = 0.03;
	this.height = 0.1;
	this.position = [0.0,-0.7];
}

Laser.prototype.setParameters = function(elapsed) {
	this.position[1] += elapsed/1000;
}

Laser.prototype.setPosition = function(x,y) {
	this.position = [x,y];
}

Laser.prototype.getPosition = function() {
	return this.position;
}

Laser.prototype.shader = function() {
	return LaserShader;
}

Laser.prototype.sendUniformVariables = function() {
	gl.uniform2fv(LaserShader.positionUniform,this.position);
}

Laser.prototype.draw = function() {
	// active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(LaserShader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// active le buffer de coords
	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
	gl.vertexAttribPointer(LaserShader.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// dessine les buffers actifs
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
}
