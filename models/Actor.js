class Actor {

    /**
     * représente un acteur ayant une position, une hitbox, un shader,
     * un sprite, et pouvant s'actualiser au fil du temps
     * @param {Number} width
     * @param {Number} height
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    constructor(width, height, x, y, z) {
        this.positions = [x, y];
        this.width = width;
        this.height = height;
        this.dead = false;

        // pré-calcul de la hitbox avant chaque frame
        this._updateHibox();

        // cree un nouveau buffer sur le GPU et l'active
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // un tableau contenant les positions des sommets (sur CPU donc)
        const wo2 = 0.5 * this.width;
        const ho2 = 0.5 * this.height;
        const vertices = [
            -wo2, -ho2, z, // bas gauche
            wo2, -ho2, z, // bas droite
            wo2, ho2, z, // haut droite
            -wo2, ho2, z // haut gauche
        ];
        // on envoie ces positions au GPU ici (et on se rappelle de leur nombre/taille)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = 4;

        // meme principe pour les coordonnees de texture
        this.coordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        const coords = [
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
        const tri = [
            0, 1, 2,
            0, 2, 3
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
        this.triangles.numItems = 6;
    }

    get x() {
        return this.positions[0];
    }

    get y() {
        return this.positions[1];
    }

    set x(x) {
        this.positions[0] = x;
    }

    set y(y) {
        this.positions[1] = y;
    }

    _updateHibox() {
        this._hitbox = {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    /**
    * @override
    * Every child must override this method
    * to bring their own shader
    */
    shader() {
        return Actor.shader;
    }

    /**
    * @override
    * Every child must override this method
    * to bring their own texture
    */
    texture() {
        return Actor.texture;
    }

    /**
    * kill the unit, doesn't update / draw anymore and release memory
    */
    die() {
        this.dead = true;
    }

    /**
     * @override
     * Called every frame to update the unit
     * @param {Number} ticks frames elapsed since game launch
     * @param {Object} keys {keyCode => pressed} the pressed keys
     * @param {Game} globals the game object to hook methods
     * @return {Boolean} kill the unit or not
     */
    update(ticks, keys, globals) {
        this._updateHibox();
        return this.dead;
    }

    /**
    * @return {Object}
    */
    hitbox() {
        return this._hitbox;
    }

    /**
    * the limits on +x, -x, +y, -y of the unit
    * @return {Object}
    */
    bounds() {
        return {
            right: World.MAX_X - this.width/2,
            left: World.MIN_X + this.width/2,
            top: World.MAX_Y - this.height/2,
            bottom: World.MIN_Y + this.height/2
        };
    }

    /**
    * send the uniform variables (@see shader)
    */
    sendUniforms(shader) {
        gl.uniform2fv(shader.positionUniform, this.positions);
    }

    /**
    * send the texture variable (@see texture)
    */
    sendTexture(shader, texture) {
        gl.activeTexture(gl.TEXTURE0); // on active l'unite de texture 0
        gl.bindTexture(gl.TEXTURE_2D, texture); // on place texture dans l'unité active
        gl.uniform1i(shader.textureUniform, 0); // on dit au shader que textureUniform se trouve sur l'unite de texture 0
        gl.clearColor(0, 0, 0, 0); // TODO qu'est-ce que ça change ?
    }

    /**
    * send the attributes variables (@see shader)
    */
    sendAttributes(shader) {
        // active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // active le buffer de coords
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        gl.vertexAttribPointer(shader.textureCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }

    /**
    * calculate collision between 2 Actors
    * @param {Actor} other
    * @return {Boolean} collided
    */
    cross (other) {
        const hitbox = this.hitbox(), oHitbox = other.hitbox();
        return oHitbox.x < hitbox.x + hitbox.width &&
            oHitbox.x + oHitbox.width > hitbox.x &&
            oHitbox.y < hitbox.y + hitbox.height &&
            oHitbox.height + oHitbox.y > hitbox.y;
    }

    /**
    * called every frame
    * send the variables and draw the element
    */
    draw() {
        const shader = this.shader();
        const texture = this.texture();

        this.sendUniforms(shader);
        this.sendTexture(shader, texture);
        this.sendAttributes(shader);

        // dessine les buffers actifs
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
        gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
    }

}

/**
* helper to init a shader
* @param {String} vs the vertex shader
* @param {String} fs the fragment shader
* @return {WebGLProgram} the compiled shader
*/
Actor.initShaders = function (vs, fs) {
    const shader = Utils.initShaders(vs, fs);

    // active ce shader
    gl.useProgram(shader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    shader.vertexPositionAttribute = gl.getAttribLocation(shader, "aVertexPosition");
    gl.enableVertexAttribArray(shader.vertexPositionAttribute); // active cet attribut

    // pareil pour les coordonnees de texture
    shader.textureCoordAttribute = gl.getAttribLocation(shader, "aTextureCoord");
    gl.enableVertexAttribArray(shader.textureCoordAttribute);

    // adresse de la variable uniforme uOffset dans le shader
    shader.positionUniform = gl.getUniformLocation(shader, "uPosition");

    shader.textureUniform = gl.getUniformLocation(shader, "uTexture");

    return shader;
};

/**
* @override
* @static
* Every child must implement this method on their class
* It initialise texture, shader and sound for the whole class
* You must call it manually => @see Game:30
* @param {WebGLTexture[]} textures the textures initialised @see Game:6
* @return {void}
*/
Actor.init = function(textures) {
  // Actor.texture = textures[0];
  // Actor.audio = new Audio('file/to/path.mp3');
  // Actor.shader = initShader('', '');
};
