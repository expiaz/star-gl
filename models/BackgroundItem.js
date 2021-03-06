class BackgroundItem extends Actor{

    constructor(x, y, velocity) {
        super(1.0, 1.0, x, y, options.background.items.z);
        this.velocity = velocity;
    }

    shader() {
        return BackgroundItem.shader;
    }

    texture() {
        return BackgroundItem.texture;
    }

    update(ticks, keys, globals) {
        if (super.update(ticks, keys, globals)) {
            return true;
        }

        this.y -= this.velocity;
        return this.y < World.MIN_Y - 0.5;
    }
}

BackgroundItem.init = function (textures) {

    BackgroundItem.texture = textures[21];
    BackgroundItem.shader = Actor.initShaders(`
        // *** le vertex shader ***
        attribute vec3 aVertexPosition; // la position du sommet
        attribute vec2 aTextureCoord; // sa coordonnee de texture

        uniform vec2 uPosition; // position du vaisseau
        varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee

        void main(void) {
          // projection de la position
          gl_Position = vec4(aVertexPosition + vec3(uPosition,0.0), 1.0);

          // stockage de la coordonnee de texture
          vTextureCoord = aTextureCoord;
        }
    `, `
        // *** le fragment shader ***
        precision highp float; // precision des nombres flottant

        varying vec2 vTextureCoord; // recuperation de la coord rasterisee

        uniform sampler2D uTexture; // la texture en entree

        void main(void) {
          // couleur par defaut du vaisseau... a changer
          //gl_FragColor = vec4(1.0,1.0,0.0,1.0);
          gl_FragColor = texture2D(uTexture, vTextureCoord);
        }
    `);
}