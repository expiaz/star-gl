class Actor {

    /**
     *
     * @param {Number} x
     * @param {Number} y
     */
    constructor(width, height, x, y, z) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dead = false;

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
        /*this.vertices = {
            00: [vertices[0], vertices[1]],
            10: [vertices[3], vertices[4]],
            11: [vertices[6], vertices[7]],
            01: [vertices[9], vertices[10]]
        };*/
        // on envoie ces positions au GPU ici (et on se rappelle de leur nombre/taille)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = 4;

        // meme principe pour les coordonnees de texture
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
        var tri = [
            0, 1, 2,
            0, 2, 3
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
        this.triangles.numItems = 6;
    }

    _updateHibox() {
        this._hitbox = {
            x: this.x + this.width / 2 - this.height / 2,
            y: this.y + this.width / 2 - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    shader() {
        return Actor.shader;
    }

    texture() {
        return Actor.texture;
    }

    die() {
        this.dead = true;
    }

    /**
     *
     * @param {Number} elapsed
     * @param {Object} keys
     * @param {Game} globals
     * @return {Boolean} is out of bounds or not
     */
    update(elapsed, keys, globals) {
        this._updateHibox();
        return this.dead;
    }

    hitbox() {
        return this._hitbox;
        /*{
            right: this.x - this.width/2,
            left: this.x + this.width/2,
            top: this.y + this.height/2,
            bottom: this.y - this.height/2
        };*/
    }

    bounds() {
        return {
            right: World.MAX_X - this.width/2,
            left: World.MIN_X + this.width/2,
            top: World.MAX_Y - this.height/2,
            bottom: World.MIN_Y + this.height/2
        };
    }

    sendUniforms(shader) {
        gl.uniform2fv(shader.positionUniform, [this.x, this.y]);
    }

    sendTexture(shader, texture) {
        gl.activeTexture(gl.TEXTURE0); // on active l'unite de texture 0
        gl.bindTexture(gl.TEXTURE_2D, texture); // on place texture dans l'unité active
        gl.uniform1i(shader.textureUniform, 0); // on dit au shader que textureUniform se trouve sur l'unite de texture 0
        // gl.clearColor(0, 0, 0, 0);
    }

    sendAttributes(shader) {
        // active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // active le buffer de coords
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        gl.vertexAttribPointer(shader.textureCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }

    cross (other) {
        const hitbox = this.hitbox(), oHitbox = other.hitbox();
        return oHitbox.x < hitbox.x + hitbox.width &&
            oHitbox.x + oHitbox.width > hitbox.x &&
            oHitbox.y < hitbox.y + hitbox.height &&
            oHitbox.height + oHitbox.y > hitbox.y;
    }

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