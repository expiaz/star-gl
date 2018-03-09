class Game {

    constructor(canvas) {
        window.gl = Utils.initWebGL(canvas);
        Heightfield.init();
        Background.init();
        Spaceship.init();
        Enemy.init();
        Laser.init();

        this.fbo = new FBO(canvas.width, canvas.height, 1, false);
        this.heightfield = new Heightfield();
        this.background = new Background(this.fbo.texture(0));
        this.spaceship = new Spaceship(0, -0.8);
        this.enemies = [];
        this.bonus = [];
        this.ticks = 0;

        this.controls = {
            pause: 'P'.charCodeAt(0)
        }

        this.lastTick = 0;
        this.keys = {};

        this.paused = false;

        // la couleur de fond sera noire
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // active le teste de profondeur
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    start() {
        // dessine la scene
        this.tick();
    }

    pause() {
        this.paused = !this.paused;
        if (false === this.paused) {
            this.lastTick = +Date.now();
            requestAnimationFrame(this.tick.bind(this));
        }
        return this.paused;
    }

    onKeyDown(event) {
        this.keys[event.keyCode] = true;
        !!this.keys[this.controls.pause] && this.pause();
    }

    onKeyUp(event) {
        this.keys[event.keyCode] = false;
    }

    tick() {
        if (this.paused) return;

        ++this.ticks;
        this.draw();
        this.update();
        requestAnimationFrame(this.tick.bind(this));
    }

    update() {
        const timeNow = +Date.now();
        if (this.lastTick !== 0) {
            // chaque objet est susceptible de s'animer
            const elapsed = timeNow - this.lastTick;
            this.heightfield.update(elapsed, this.keys);
            this.background.update(elapsed, this.keys);
            this.spaceship.update(elapsed, this.keys);
            this.enemies = this.enemies.filter(e => !e.update(elapsed, this.keys));

            if(this.ticks > 10) {
                this.ticks = 0;
                this.enemies.push(new Enemy(Math.random() - Math.random(), 0.9));
            }
        }
        this.lastTick = timeNow;
    }

    draw() {
        // initialisation du viewport
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        // efface les buffers de couleur et de profondeur
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // active le FBO (a partie de la, on dessine dans la texture associée)
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.id());
        // dessin du heightfield
        this.heightfield.draw();
        // desactivation du FBO (on dessine sur l'ecran maintenant)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // dessin du background (utilise la texture dessinée précédemment)
        this.background.draw();

        //dessin des ennemis
        if (this.enemies.length) {
            this.enemies.forEach(e => e.draw());
        }

        // dessin du vaisseau (shader par defaut ici)
        this.spaceship.draw();
    }

}