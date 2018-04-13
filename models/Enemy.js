class Enemy extends Actor {

    constructor(x, y, intervalX, lasers = []) {
        super(0.1, 0.1, x, y, options.enemy.z);
        // moving speed each frame
        this.speed = options.enemy.speed;
        // forward speed each frame
        this.fireSpeed = options.enemy.lasers.speed;
        // frames between each fire
        this.fireRate = options.enemy.lasers.rate;

        this._lasers = lasers;

        this.interval = [(x - intervalX) % World.MIN_X, (x + intervalX) % World.MAX_X];
        this.phase = Enemy.phase.LEFT;

        this.lastExplosionTick = 0;
        this.lastFireTick = 0;

        this.currentTexture = Enemy.texture;
        this.currentTextureIndex = 0;

        this.deathAudio = new Audio('./son/explosion.mp3');
        this.blasterAudio = [
            new Audio('./son/TieBlaster.mp3'),
            new Audio('./son/TieBlaster.mp3'),
            new Audio('./son/TieBlaster.mp3'),
        ];
        this.currentAudioTrack = 0;
    }

    shader() {
        return Enemy.shader;
    }

    texture() {
        return this.currentTexture;
    }

    bounds() {
        return {
            right: this.interval[0] - this.width / 2,
            left: this.interval[1] + this.width / 2,
            top: World.MAX_Y - this.height / 2,
            bottom: World.MIN_Y + this.height / 2
        };
    }

    die() {
        super.die();
        if (game.audio) {
            this.deathAudio.play();
        }
    }

    cross(other) {
        if (this.dead) {
            return false;
        }
        return super.cross(other);
    }

    update(ticks, keys, globals) {
        super.update(ticks, keys, globals);

        if (this.dead) {
            if (!this.lastExplosionTick || ticks - this.lastExplosionTick > options.enemy.explosion) {
                if (this.currentTextureIndex === Enemy.explosionTextures.length) {
                    return true;
                }
                this.currentTexture = Enemy.explosionTextures[this.currentTextureIndex];
                this.lastExplosionTick = ticks;
                this.currentTextureIndex++;
            }
            return false;
        }

        const decrement = globals.timeSpeed * this.speed;

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

        this.fire(ticks);

        if (this.y <= World.MIN_Y) {
            // out of bounds, player loss 1k points
            globals.score(-options.enemy.points * 2);
        }

        return this.y <= World.MIN_Y;
    }

    fire(ticks) {
        if (ticks - this.lastFireTick < this.fireRate) {
            return;
        }

        this.lastFireTick = ticks;

        if (game.audio) {
            const audio = this.blasterAudio[this.currentAudioTrack];
            audio.currentTime = 0;
            audio.play();
            this.currentAudioTrack = ++this.currentAudioTrack % this.blasterAudio.length;
        }

        this._lasers.push(new EnemyLaser(this.x, this.y - 0.07, this.fireSpeed));
    }

}

Enemy.phase = {
    RIGHT: 0,
    LEFT: 1
};

Enemy.init = function (textures) {

    Enemy.texture = textures[2];

    Enemy.explosionTextures = textures.slice(6, 9);

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
