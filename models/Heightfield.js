class Heightfield {

    constructor() {
        this.timer = 0.0;
        this.offset = [0.0, 0.0];
        this.amplitude = 2.0;
        this.frequency = 6.0;
        this.persistence = 0.5;

        // cree un nouveau buffer sur le GPU et l'active
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        // un tableau contenant les positions des sommets (sur CPU donc)
        const vertices = [
            -1.0,-1.0, Heightfield.z,
            1.0,-1.0, Heightfield.z,
            1.0, 1.0, Heightfield.z,
            -1.0, 1.0, Heightfield.z
        ];
        // on envoie ces positions au GPU ici (et on se rappelle de leur nombre/taille)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = 4;

        // meme principe pour les couleurs
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
        const tri = [0,1,2,0,2,3];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
        this.triangles.numItems = 6;
    }

    shader() {
        return Heightfield.shader;
    }

    update(ticks, keys, globals) {
        const timer = ticks *  0.008;
        const speed = 0.5;
        this.offset[1] = this.offset[1] + 0.008 * speed;
        this.amplitude = 0.2 + 3.0 * (Math.sin(timer * 0.1) * 0.5 + 0.5);
        this.frequency = 5.0 - speed;
    }

    sendUniforms(shader) {
        gl.uniform2fv(shader.offsetUniform, this.offset);
        gl.uniform1f(shader.amplitudeUniform, this.amplitude);
        gl.uniform1f(shader.frequencyUniform, this.frequency);
        gl.uniform1f(shader.persistenceUniform, this.persistence);
    }

    sendAttributes(shader) {
        // active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // active le buffer de coords
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        gl.vertexAttribPointer(shader.textureCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }

    draw() {
        const shader = this.shader();

        // gl.useProgram(shader);

        this.sendUniforms(shader);
        this.sendAttributes(shader);

        // dessine les buffers actifs
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
        gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
    }

}

Heightfield.z = 0.0;

Heightfield.init = function () {
    const heightfieldShader = Utils.initShaders(`
        // *** le vertex shader ***
        attribute vec3 aVertexPosition; // la position du sommet
        attribute vec2 aTextureCoord; // sa coordonnee de texture
        
        varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee
        
        void main(void) {
        // projection de la position
        gl_Position = vec4(aVertexPosition, 1.0);
        
        // stockage de la coordonnee de texture
        vTextureCoord = aTextureCoord;
        }
    `, `
        // *** le fragment shader ***
        precision highp float; // precision des nombres flottant
        
        uniform vec2 uOffset;
        uniform float uAmplitude; // amplitude du bruit
        uniform float uFrequency; // frequence du bruit
        uniform float uPersistence; // persistence du bruit
        
        varying vec2 vTextureCoord; // recuperation de la coord rasterisee
        
        float hash(vec2 p) {
          // pseudo random fonction
          float h = dot( mod(p, vec2(100.0)), vec2(127.1,311.7));
          return -1.0 + 2.0 * fract( sin(h) * 43758.5453123);
        }
        
        float vnoise(in vec2 p) {
          // genere une valeur random sur une position spécifique d'une grille
          // pris sur shadertoy
          vec2 i = floor(p);
          vec2 f = fract(p);
        
          vec2 u = f * f * (3.0 - 2.0 * f);
        
          return mix( mix( hash( i + vec2(0.0,0.0) ),
          hash( i + vec2(1.0,0.0) ), u.x),
          mix( hash( i + vec2(0.0, 1.0) ),
          hash( i + vec2(1.0, 1.0) ), u.x), u.y);
        }
        
        float fractalNoise(in vec2 p) {
          const int nb = 5; // nb octave
          float f = uFrequency; // frequency
          float a = uAmplitude; // amplitude
          float e = uPersistence; // persistence
        
          float n = 0.0;
          for(int i = 0; i < nb; ++i) {
            n = n + a * vnoise(p * f);
            f = 2.0 * f;
            a = a * e;
          }
          return n;
        }
        
        void main(void) {
          vec2 p = vTextureCoord * 2.0 - vec2(1.0); // coordonnees
          float n = fractalNoise(p + uOffset) * 0.2 + 0.2; // bruit
        
          gl_FragColor = vec4(vec3(n), 1.0);
        }
    `);

    // active ce shader
    gl.useProgram(heightfieldShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    heightfieldShader.vertexPositionAttribute = gl.getAttribLocation(heightfieldShader, "aVertexPosition");
    gl.enableVertexAttribArray(heightfieldShader.vertexPositionAttribute); // active cet attribut

    // pareil pour les coordonnees de texture
    heightfieldShader.textureCoordAttribute = gl.getAttribLocation(heightfieldShader, "aTextureCoord");
    gl.enableVertexAttribArray(heightfieldShader.textureCoordAttribute);

    // adresse de la variable uniforme uOffset dans le shader
    heightfieldShader.offsetUniform = gl.getUniformLocation(heightfieldShader, "uOffset");
    heightfieldShader.amplitudeUniform = gl.getUniformLocation(heightfieldShader, "uAmplitude");
    heightfieldShader.frequencyUniform = gl.getUniformLocation(heightfieldShader, "uFrequency");
    heightfieldShader.persistenceUniform = gl.getUniformLocation(heightfieldShader, "uPersistence");

    Heightfield.shader = heightfieldShader;
};