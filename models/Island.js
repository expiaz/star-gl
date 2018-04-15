class Island extends Actor{

    constructor(x, y, velocity, width = 1.0, height = 1.0) {
        super(width, height, x, y, Island.z);
        this.velocity = velocity;
    }

    shader() {
        return Island.shader;
    }

    texture() {
        return Island.texture;
    }

    update(ticks, keys, globals) {
        if (super.update(ticks, keys, globals)) {
            return true;
        }

        /*if (globals.spaceship.cross(this)) {
            this.die();
            globals.spaceship.hit();
            globals.score(- EnemyLaser.points * 2);
            return true;
        }*/

        this.y -= globals.timeSpeed * this.velocity;
        return this.y < World.MIN_Y;
    }
}

Island.z = -0.1;

Island.init = function (textures) {

    Island.texture = textures[21];
    Island.shader = Actor.initShaders(`
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