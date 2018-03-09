class Laser extends Actor {

    constructor(x, y, velocity, width = 0.03, height = 0.1) {
        super(width, height, x, y, Laser.z);
        this.velocity = velocity;
    }

    shader() {
        return Laser.shader;
    }

    texture() {
        return Laser.texture;
    }

    /**
     *
     * @param {Number} elapsed
     * @param {Object} keys
     * @return {Boolean} should render
     */
    update(elapsed, keys) {
        this.y += elapsed / this.velocity;
        return this.y >= World.MAX_Y;
    }

}

Laser.z = -0.8;

Laser.init = function () {

    Laser.texture = Utils.initTexture('img/laser.png');

    Laser.shader = Actor.initShaders(`
        // *** le vertex shader ***
        attribute vec3 aVertexPosition; // la position du sommet
        attribute vec2 aTextureCoord; // sa coordonnee de texture
    
        uniform vec2 uPosition; // position du vaisseau
        varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee
    
        void main(void) {
          // projection de la position
          gl_Position = vec4(aVertexPosition+vec3(uPosition,0.0), 1.0);
    
          // stockage de la coordonnee de texture
          vTextureCoord = aTextureCoord;
        }
    `,`
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