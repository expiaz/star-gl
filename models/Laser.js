class Laser extends Actor {

    constructor(x, y, velocity) {
        super(0.03, 0.1, x, y, options.spaceship.lasers.z);
        this.velocity = velocity;
    }

    shader() {
        return Laser.shader;
    }

    texture() {
        return Laser.texture;
    }

    update(ticks, keys, globals) {
        if (super.update(ticks, keys, globals)) {
            return true;
        }

        for(let i = 0; i < globals.enemies.length; i++) {
            if (globals.enemies[i].cross(this)) {
                globals.enemies[i].die();
                this.die();
                globals.score(options.enemy.points);
                return true;
            }
        }

        for(let i = 0; i < globals.enemyLasers.length; i++) {
            if (this.cross(globals.enemyLasers[i])) {
                globals.enemyLasers[i].die();
                this.die();
                globals.score(options.enemy.lasers.points);
                return true;
            }
        }

        this.y += globals.timeSpeed * this.velocity;
        return this.y > World.MAX_Y;
    }

}

Laser.init = function (textures) {

    Laser.texture = textures[3];

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
};
