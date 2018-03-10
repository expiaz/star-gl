class Enemy extends Actor {

    constructor(x, y, intervalX) {
        super(0.1, 0.1, x, y, Enemy.z);
        this.timeElapsedSinceLastFire = +Date.now()
        this.speed = 1500;
        this.fireRate = 2;
        this.fireSpeed = 700;

        this.interval = [(x - intervalX) % World.MIN_X, (x + intervalX) % World.MAX_X];
        this.phase = Enemy.phase.LEFT;

        this.ticks = 0;

        this.actualTexture = Enemy.texture;
    }

    /**
     *
     * @return {*|Enemy.shader|Actor.shader}
     */
    shader() {
        return Enemy.shader;
    }

    texture(shader) {
        return this.actualTexture;
    }

    bounds() {
        return {
            right: this.interval[0] - this.width/2,
            left: this.interval[1] + this.width/2,
            top: World.MAX_Y - this.height/2,
            bottom: World.MIN_Y + this.height/2
        };
    }

    update(elapsed, keys, globals) {
        super.update(elapsed, keys, globals);

        // const bounds = this.bounds();

        if (this.dead) {
            ++this.ticks;
            if (this.ticks > Enemy.explosionTextures.length * 5) {
                this.ticks = 0;
                return true;
            }
            if (this.ticks % 5 === 0) {
                this.actualTexture = Enemy.explosionTextures[this.ticks/5];
            }
        } else {

            if (this.cross(globals.spaceship)) {
                this.die();
                // TODO refacto
                globals.spaceship.life--;
            }

            const decrement = elapsed / this.speed;

            if (this.phase === Enemy.phase.LEFT) {
                if (this.x > this.interval[0]) {
                    this.x -= decrement;
                } else {
                    this.phase = Enemy.phase.RIGHT;
                }
            } else if (this.phase === Enemy.phase.RIGHT) {
                if (this.x < this.interval[1]) {
                    this.x += decrement;
                } else {
                    this.phase = Enemy.phase.LEFT;
                }
            }

            this.y -= decrement;

            this.fire(globals.enemyLasers);
        }

        return this.y <= World.MIN_Y;
    }

    /*draw() {
        super.draw();
        if (this.lasers.length) {
            this.lasers.forEach(laser => laser.draw());
        }
    }*/

    fire(lasers) {
        const now = +Date.now()
        const elapsed = now - this.timeElapsedSinceLastFire;
        if (elapsed > 1 / this.fireRate * 1000) {
            this.timeElapsedSinceLastFire = now;
            lasers.push(new EnemyLaser(this.x, this.y + -0.07, this.fireSpeed));
        }
    }

}

Enemy.phase = {
    RIGHT: 0,
    LEFT: 1
};

Enemy.z = -0.5;

Enemy.init = function (textures) {

    Enemy.texture = textures[1];

    Enemy.explosionTextures = textures.slice(3, 8);

    Enemy.shader = Actor.initShaders(`
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