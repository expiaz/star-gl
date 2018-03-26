class Spaceship extends Actor {

    constructor(x, y) {
        super(0.2, 0.2, x, y, Spaceship.z);
        this.timeElapsedSinceLastFire = +Date.now();
        this.currentAudioTrack = 0;
        this._fireRate = Spaceship.fireRate;
        this.verticalSpeed = Spaceship.speed;
        this.horizontalSpeed = Spaceship.speed;
        this.fireSpeed = 500;
        this._life = Spaceship.lifes;
        this._lasers = Spaceship.lasers;

        this.flicker = 0;

        this.currentTexture = Spaceship.texture;
    }

    /**
     *
     * @return {*|Enemy.shader|Actor.shader}
     */
    shader() {
        return Spaceship.shader;
    }

    texture() {
        return this.currentTexture;
    }

    get lasers() {
        return this._lasers;
    }

    set lasers(lasers) {
        this._lasers = lasers > Spaceship.MAX_LASERS ? Spaceship.MAX_LASERS : lasers;
    }

    get life() {
        return this._life;
    }

    set life(life) {
        this._life = life % Spaceship.MAX_LIFES;
    }

    get fireRate() {
        return this._fireRate;
    }

    set fireRate(fireRate) {
        this._fireRate = fireRate > Spaceship.MAX_FIRE_RATE ? Spaceship.MAX_FIRE_RATE : fireRate;
    }

    get speed() {
      return (this.verticalSpeed + this.horizontalSpeed) / 2;
    }

    set speed(speed) {
      const s = speed > Spaceship.MAX_SPEED ? Spaceship.MAX_SPEED : speed;
      this.verticalSpeed = s;
      this.horizontalSpeed = s;
    }

    hit() {
        this.life -= 1;
        if (0 === this.life) {
            this.die()
        }
        this.flicker = 100;
        // TODO update lifes
    }

    /**
     *
     * @param {Number} elapsed
     * @param {Object} keys
     * @param {Game} globals
     * @return {Boolean} is out of bounds or not
     */
    update(elapsed, keys, globals) {

        if (super.update(elapsed, keys, globals)) {
            // dead by another object
            return true;
        }

        if (this.flicker) {
            if (0 === this.flicker % 10) {
                // play flickering
                if (0 === this.flicker / 10 % 2) {
                    this.currentTexture = Spaceship.textureHit;
                } else {
                    this.currentTexture = Spaceship.texture;
                }
            }
            --this.flicker;
        }

        const bounds = this.bounds();

        if (keys[81]) { // left arrow
            let nextX = this.x - this.horizontalSpeed;
            if (nextX < bounds.left) {
                nextX = bounds.left;
            }
            this.x = nextX;
        }
        if (keys[68]) { // right arrow
            let nextX = this.x + this.horizontalSpeed;
            if (nextX > bounds.right) {
                nextX = bounds.right;
            }
            this.x = nextX;
        }
        if (keys[90]) { // up arrow
            let nextY = this.y + this.verticalSpeed;
            if (nextY > bounds.top) {
                nextY = bounds.top;
            }
            this.y = nextY;
        }
        if (keys[83]) { // down arrow
            let nextY = this.y - this.verticalSpeed;
            if (nextY < bounds.bottom) {
                nextY = bounds.bottom;
            }
            this.y = nextY;
        }

        if (keys[32]) { // space
            this.fire(globals.lasers);
        }

        return false;
    }

    cross(other) {
        if (this.flicker > 0) {
            // while playing touched (flickering) animation,
            // it's impossible to be touched again
            return false;
        }
        return super.cross(other);
    }

    /**
     *
     * @param {Array<Laser>} lasers
     */
    fire(lasers) {
        const now = +Date.now()
        const elapsed = now - this.timeElapsedSinceLastFire;
        if (elapsed > 1 / this.fireRate * 1000) {
            this.timeElapsedSinceLastFire = now;

            if (game.audio) {
                const audio = Spaceship.audio[this.currentAudioTrack];
                audio.currentTime = 0;
                audio.play();
                this.currentAudioTrack = ++this.currentAudioTrack % Spaceship.audio.length;
            }

            const ll = this.lasers / 2;
            for (var i = 0; i < ll; i++) {
                const y = this.y + 0.1;
                const offset = 0.03 * i;
                lasers.push(new Laser(this.x - 0.093 /* this.width / 2.8 */ + offset, y /*this.height / 2*/, this.fireSpeed));
                lasers.push(new Laser(this.x + 0.093 /* this.width / 2.8 */ - offset, y /*this.height / 2*/, this.fireSpeed));
            }
        }
    }

}

Spaceship.MAX_LASERS = 8;
Spaceship.MAX_LIFES = 10;
Spaceship.MAX_FIRE_RATE = 15;
Spaceship.MAX_SPEED = 0.06;

Spaceship.lasers = 2;
Spaceship.fireRate = 5;
Spaceship.speed = 0.02;
Spaceship.z = -0.6;
Spaceship.lifes = 3;

Spaceship.init = function (textures) {

    Spaceship.texture = textures[0];
    Spaceship.textureHit = textures[1];

    Spaceship.audio = [
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
        new Audio('./son/Xwingblaster.mp3'),
    ];

    Spaceship.audio.forEach(track => {
        track.volume = 0.7;
    });

    Spaceship.shader = Actor.initShaders(`
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
};
