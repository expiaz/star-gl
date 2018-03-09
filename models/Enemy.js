class Enemy extends Actor {

    constructor(x, y) {
        super(0.1, 0.1, x, y, Enemy.z);
        this.timeElapsedSinceLastFire = +Date.now()
        this.speed = 1500;
        this.fireRate = 1;
        this.fireSpeed = 1000;

        this.lasers = [];
    }

    /**
     *
     * @return {*|Enemy.shader|Actor.shader}
     */
    shader() {
        return Enemy.shader;
    }

    texture(shader) {
        return Enemy.texture;
    }

    /**
     *
     * @param {Number} elapsed
     * @param {Object} keys
     * @return {Boolean} is out of bounds or not
     */
    update(elapsed, keys) {
        this.lasers = this.lasers.filter(laser => !laser.update(elapsed, keys));
        this.y -= elapsed / this.speed;
        this.fire();
        return this.y <= World.MIN_Y;
    }

    draw() {
        super.draw();
        if (this.lasers.length) {
            this.lasers.forEach(laser => laser.draw());
        }
    }

    fire() {
        const now = +Date.now()
        const elapsed = now - this.timeElapsedSinceLastFire;
        if (elapsed > 1 / this.fireRate * 1000) {
            this.timeElapsedSinceLastFire = now;
            this.lasers.push(new EnemyLaser(this.x, this.y + -0.07, this.fireSpeed));
        }
    }

}

Enemy.z = -0.5;

Enemy.init = function () {

    Enemy.texture = Utils.initTexture('img/tie.png');

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