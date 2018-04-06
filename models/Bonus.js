class Bonus extends Actor {

    constructor(x, speed) {
        super(0.05, 0.05, x, 1.1, Bonus.z);
        this.audio = new Audio('./son/explosion.mp3');
        this.velocity = speed;
        this.activated = false;
    }

    /**
     * called when a bonus is collected
     * @param {Spaceship} target
     * @param {Game} globals
     */
    collected(target, globals) {
        if (globals.audio) {
            this.audio.play();
        }
        this.activated = true;
    }

    /**
     *
     * @param ticks
     * @param keys
     * @param globals
     * @return {boolean} shouldn't be updated anymore (bonus ended)
     */
    active(ticks, keys, globals) {
        return true;
    }

    shader() {
        return Bonus.shader;
    }

    texture() {
        return Bonus.texture;
    }

    update(ticks, keys, globals) {
        super.update(ticks, keys, globals);

        if(this.activated) {
            return this.active(ticks, keys, globals);
        }

        for (let i = 0; i < globals.spaceships.length; ++i) {
            if (this.cross(globals.spaceships[i])) {
                this.collected(globals.spaceships[i], globals);
                return false;  // do not remove the bonus, just don't draw it anymore
            }
        }

        this.y -= globals.timeSpeed * this.velocity;
        return this.y < World.MIN_Y;
    }

    draw() {
        if (this.activated) {
            return;
        }
        super.draw();
    }

}

Bonus.z = -0.5;

Bonus.verticalSpeed = 0.02;

Bonus.init = function (textures) {

    LifeBonus.init(textures);
    LaserBonus.init(textures);
    SpeedBonus.init(textures);
    TimeBonus.init(textures);
    InvincibleBonus.init(textures);

    Bonus.texture = textures[0];

    Bonus.shader = Actor.initShaders(`
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
