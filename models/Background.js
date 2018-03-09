class Background {

    constructor(heightFieldTexture) {
        this.heightFieldTexture = heightFieldTexture;

        // cree un nouveau buffer sur le GPU et l'active
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // un tableau contenant les positions des sommets (sur CPU donc)
        var vertices = [
            -1.0, -1.0, Background.z,
            1.0, -1.0, Background.z,
            1.0, 1.0, Background.z,
            -1.0, 1.0, Background.z
        ];
        // on envoie ces positions au GPU ici (et on se rappelle de leur nombre/taille)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = 4;

        // meme principe pour les normals
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        var normals = [
            0.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        this.normalBuffer.itemSize = 2;
        this.normalBuffer.numItems = 4;

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
        var tri = [
            0, 1, 2,
            0, 2, 3
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
        this.triangles.numItems = 6;
    }

    shader() {
        return Background.shader;
    }

    texture() {
        return this.heightFieldTexture
    }

    update(elapsed, keys) {

    }

    sendUniforms(shader) {
        gl.uniform2fv(shader.textureSizeUniform, [
            this.heightFieldTexture.width,
            this.heightFieldTexture.height
        ]);
    }

    sendTexture(shader, texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(shader.heightfieldUniform, 0);
    }

    sendAttributes(shader) {
        // active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // active le buffer de couleurs et fait le lien avec l'attribut aVertexColor dans le shader
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(shader.vertexNormalAttribute, this.normalBuffer.itemSize, gl.FLOAT, true, 0, 0);
        // active le buffer de coords
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
        gl.vertexAttribPointer(shader.textureCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }

    draw() {
        const shader = this.shader();
        const texture = this.texture();

        gl.useProgram(shader);

        this.sendUniforms(shader);
        this.sendTexture(shader, texture);
        this.sendAttributes(shader);

        // dessine les buffers actifs
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
        gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
    }

}

Background.z = 0.0;

Background.init = function () {
    const backgroundShader = Utils.initShaders(`
        // *** le vertex shader ***
        attribute vec3 aVertexPosition; // la position du sommet
        attribute vec2 aTextureCoord; // sa coordonnee de texture
        attribute vec2 aVertexNormal; // sa coordonnee de texture
        
        uniform mat4 uMVMatrix; // modelviewMatrix
        uniform mat3 uNMatrix; // normalMatrix
        uniform mat4 uPMatrix; // projectionMatrix
        
        varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee
        varying vec3 vNormal; // on souhaite rasteriser la normale
        varying vec4 vPosition; // on souhaite rasteriser la position
        
        void main(void) {
          // projection de la position
          gl_Position = vec4(aVertexPosition, 1.0);
        
          //vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
        
          //vNormal = uNMatrix * aVertexNormal;
        
          // projection de la position
          //  gl_Position = uPMatrix * vPosition;
        
          // stockage de la coordonnee de texture
          vTextureCoord = aTextureCoord;
        }
    `, `
        // *** le fragment shader ***
        precision highp float; // precision des nombres flottant
    
        uniform sampler2D uHeightfield; // la texture de hauteurs
        uniform vec2 uTextureSize; // la taille de la texture
        varying vec2 vTextureCoord; // recuperation de la coord rasterisee
        varying vec3 vNormal; // recuperation de la normale rasterisee
        varying vec4 vPosition; // recuperation de la position rasterisee
    
        vec3 shade(in vec3 n,in float d) {
            vec2 xy = vTextureCoord.xy * 2.0 - vec2(1.0);
            vec3 v = - normalize(vec3(xy.x, xy.y, 1.0)); // vecteur vue
            vec3 l = normalize(vec3(-0.3, 0.0, 1.0)); // vecteur lumière (pourrait varier au cours du temps pour de meilleurs effets)
            
            // TODO : le shading !
            // la fonction prend en entrée la normale du terrain et sa profondeur
            
            return n;
        }
    
        vec3 computeNormal() {
            const float scale = 20.0;
            
            vec2 ps = 1.0/uTextureSize;
            float xp = texture2D(uHeightfield, vTextureCoord + vec2( ps.x, 0.0)).x;
            float xm = texture2D(uHeightfield, vTextureCoord + vec2(-ps.x, 0.0)).x;
            float yp = texture2D(uHeightfield, vTextureCoord + vec2(0.0, ps.y)).x;
            float ym = texture2D(uHeightfield, vTextureCoord + vec2(0.0, -ps.y)).x;
            
            float gx = 0.5 * (xp - xm) * scale;
            float gy = 0.5 * (yp - ym) * scale;
            
            vec3 v1 = normalize(vec3(1.0, 0.0, gx));
            vec3 v2 = normalize(vec3(0.0, 1.0, gy));
            
            return cross(v1, v2);
        }
    
        void main(void) {
            vec3 n = normalize(vNormal);
            vec3 v = normalize(vPosition.xyz);
            vec3 l = normalize(vec3(0.0, 0.0, 1.0));
            vec3 r = reflect(l, n);
            
            float coefD = max(dot(n, l), 0.0);
            float coefS = pow(max(dot(v, r), 0.0), 20.0);
            
            vec3 Ka = vec3(0.1);
            vec3 Kd = vec3(0.5, 0.5, 0.75);
            vec3 Ks = vec3(1);
            
            vec3 c = Ka + Kd * coefD + Ks * coefS;
            
            float sd = texture2D(uHeightfield, vTextureCoord).x;
            vec3 cn = computeNormal();
            vec3 s = shade(cn, sd);
            gl_FragColor = vec4(s, 1.0);
        }
    `);

    // active ce shader
    gl.useProgram(backgroundShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    backgroundShader.vertexPositionAttribute = gl.getAttribLocation(backgroundShader, "aVertexPosition");
    gl.enableVertexAttribArray(backgroundShader.vertexPositionAttribute); // active cet attribut

    backgroundShader.textureCoordAttribute = gl.getAttribLocation(backgroundShader, "aTextureCoord");
    gl.enableVertexAttribArray(backgroundShader.textureCoordAttribute);

    backgroundShader.vertexNormalAttribute = gl.getAttribLocation(backgroundShader, "aVertexNormal");
    gl.enableVertexAttribArray(backgroundShader.vertexNormalAttribute);

    // adresse de la texture uHeightfield dans le shader
    backgroundShader.heightfieldUniform = gl.getUniformLocation(backgroundShader, "uHeightfield");
    backgroundShader.textureSizeUniform = gl.getUniformLocation(backgroundShader, "uTextureSize");

    Background.shader = backgroundShader;
};