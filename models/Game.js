class Game {

    constructor(canvas) {
        window.gl = Utils.initWebGL(canvas);

        Utils.loadTextures([
            'img/t65.png',
            'img/tie.png',
            'img/laser.png',
            'img/explosions/explosion1.png',
            'img/explosions/explosion2.png',
            'img/explosions/explosion3.png',
            'img/explosions/explosion4.png',
            'img/explosions/explosion5.png',
            'img/explosions/explosion6.png',
            'img/explosions/explosion7.png',
            'img/explosions/explosion8.png',
            'img/explosions/explosion9.png',
            'img/explosions/explosion10.png',
            'img/explosions/explosion11.png',
            'img/explosions/explosion12.png',
            'img/explosions/explosion13.png',
            'img/explosions/explosion14.png',
        ]).then(textures => {
            Heightfield.init(textures);
            Background.init(textures);
            Spaceship.init(textures);
            Enemy.init(textures);
            Laser.init(textures);
            EnemyLaser.init(textures);

            this.lasers = [];
            this.enemyLasers = [];

            this.fbo = new FBO(canvas.width, canvas.height, 1, false);
            this.heightfield = new Heightfield();
            this.background = new Background(this.fbo.texture(0));
            this.spaceship = new Spaceship(0, -0.8);
            this.enemies = [];
            this.bonus = [];

            this.ticks = 0;

            this.controls = {
                pause: 'P'.charCodeAt(0)
            };

            this.lastTick = 0;
            this.keys = {};

            this.paused = false;
            this.ended = false;
            this.started = false;

            this.totalScore = 0;
            this.scoreBoard = JSON.parse(localStorage.getItem('star-gl') || '[]');

            this.layout = {
                layout: document.querySelector('.game-layout'),
                life: document.querySelector('.game-layout .life'),
                score: document.querySelector('.game-layout .score'),
                upscore: document.querySelector('.game-layout .upscore'),
                start: document.querySelector('.game-layout .start-screen'),
                end: document.querySelector('.game-layout .end-screen'),
            };

            this.layout.layout.removeChild(this.layout.upscore);

            // la couleur de fond sera noire
            //gl.clearColor(0.0, 0.0, 0.0, 1.0);

            // active le teste de profondeur
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            window.addEventListener('keydown', this.onKeyDown.bind(this));
            window.addEventListener('keyup', this.onKeyUp.bind(this));
            window.addEventListener('click', _ => {
                if (false === this.started) {
                    this.start();
                } else if (this.ended === true) {
                    window.location.reload();
                }
            });

            this.layout.score.textContent = 0;
            this.layout.life.textContent = this.spaceship.life;
            this.layout.start.style.opacity = '1';
        });
    }

    start() {
        // dessine la scene
        this.started = true;
        this.layout.start.style.opacity = '0';
        this.tick();
    }

    end() {
        this.paused = true;
        this.ended = true;

        this.scoreBoard.push(this.totalScore);
        const scoreBoard = this.scoreBoard.sort((a,b) => a < b)
                                          .filter(e => e > 0).slice(0, 5);
        localStorage.setItem('star-gl', JSON.stringify(scoreBoard));
        const list = this.layout.end.querySelector('.highscores');
        scoreBoard.forEach(score => {
            const li = document.createElement('li');
            li.textContent = score;
            if (score === this.totalScore) {
                li.style.color = 'red';
            }
            list.appendChild(li);
        });
        this.layout.end.querySelector('.playerscore').textContent = this.totalScore;

        this.layout.end.style.opacity = '1';
    }

    score(number) {
        this.totalScore += number;
        if (this.totalScore < 0) {
            this.totalScore = 0;
        }

        // play score animation
        this.layout.score.textContent = this.totalScore;
        this.layout.upscore.textContent = number < 0 ? `-${number}` : `+${number}`;
        this.layout.upscore.style.color = number < 0 ? 'red' : 'green';
        this.layout.layout.appendChild(this.layout.upscore);
        setTimeout(() => {
          this.layout.layout.removeChild(this.layout.upscore);
        }, 2000);
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
            const lifeNow = this.spaceship.life;

            const elapsed = timeNow - this.lastTick;
            this.heightfield.update(elapsed, this.keys, this);
            this.background.update(elapsed, this.keys, this);

            if (this.spaceship.update(elapsed, this.keys, this)) {
                // game over no more lifes
                this.end();
                return;
            }

            this.enemies = this.enemies.filter(e => !e.update(elapsed, this.keys, this));
            this.lasers = this.lasers.filter(laser => !laser.update(elapsed, this.keys, this));
            this.enemyLasers = this.enemyLasers.filter(laser => !laser.update(elapsed, this.keys, this));

            if(this.ticks > 50) {
                this.ticks = 0;
                this.enemies.push(new Enemy(Math.random() - Math.random(), 1.1, Math.random()));
            }

            if (this.spaceship.life !== lifeNow) {
                this.layout.life.textContent = this.spaceship.life;
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
        gl.useProgram(Heightfield.shader);
        this.heightfield.draw();
        // desactivation du FBO (on dessine sur l'ecran maintenant)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // dessin du background (utilise la texture dessinée précédemment)
        gl.useProgram(Background.shader);
        this.background.draw();

        //dessin des ennemis
        if (this.enemies.length) {
            gl.useProgram(Enemy.shader);
            this.enemies.forEach(e => e.draw());
        }

        if (this.enemyLasers.length) {
            gl.useProgram(EnemyLaser.shader);
            this.enemyLasers.forEach(laser => laser.draw());
        }

        // dessin du vaisseau (shader par defaut ici)
        gl.useProgram(Spaceship.shader);
        this.spaceship.draw();

        if (this.lasers.length) {
            gl.useProgram(Laser.shader);
            this.lasers.forEach(laser => laser.draw());
        }
    }

}
