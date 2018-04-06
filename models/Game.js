class Game {

    constructor(canvas) {
        window.gl = Utils.initWebGL(canvas);

        Utils.loadTextures([
            'img/t65.png',
            'img/t65_hit.png',
            'img/tie.png',
            'img/laser.png',
            'img/laser_tie.png',
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
            'img/heart.png',
            'img/empty_heart.png',
        ]).then(textures => {
            Heightfield.init(textures);
            Background.init(textures);
            Spaceship.init(textures);
            Enemy.init(textures);
            Laser.init(textures);
            EnemyLaser.init(textures);
            Bonus.init(textures);

            Game.bonus = Utils.shuffle([
                LifeBonus,
                LaserBonus,
                SpeedBonus,
                TimeBonus,
            ].reduce(
                (all, bonus) => all.concat(new Array(bonus.rate || 1).fill(bonus)),
                []
            ));

            this.lasers = [];
            this.enemyLasers = [];

            this.fbo = new FBO(canvas.width, canvas.height, 1, false);
            this.heightfield = new Heightfield();
            this.background = new Background(this.fbo.texture(0));
            this.enemies = [];
            this.bonus = [];
            this.spaceships = [];

            this.fps = 0;
            // used to accelerate or diminize moving objects (and game speed)
            this.timeSpeed = 1;
            this.ticks = 0;
            this.totalScore = 0;

            this.timer = Date.now();

            this.keys = {};
            this.controls = {
                pause: 'P'.charCodeAt(0),
                sound: 'M'.charCodeAt(0)
            };

            this.audio = false;
            this.paused = false;
            this.ended = false;
            this.started = false;


            this.scoreBoard = JSON.parse(localStorage.getItem('star-gl') || '[]');

            this.layout = {
                layout: document.querySelector('.game-layout'),
                life: document.querySelector('.game-layout .life'),
                emptyLife: document.querySelector('.game-layout .life .empty'),
                fullLife: document.querySelector('.game-layout .life .full'),
                score: document.querySelector('.game-layout .score'),
                upscore: document.querySelector('.game-layout .upscore'),
                start: document.querySelector('.game-layout .start-screen'),
                end: document.querySelector('.game-layout .end-screen'),
                game: document.querySelector('.game-layout .game-screen')
            };

            this.layout.layout.removeChild(this.layout.upscore);
            this.lifes = new Lifes(Spaceship.lifes, Spaceship.MAX_LIFES);
            this.drawLifes();

            // la couleur de fond sera noire
            //gl.clearColor(0.0, 0.0, 0.0, 1.0);

            // active le teste de profondeur
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            window.addEventListener('keydown', this.onKeyDown.bind(this));
            window.addEventListener('keyup', this.onKeyUp.bind(this));
            window.addEventListener('click', () => {
                if (false === this.started) {
                    this.start();
                } else if (this.ended === true) {
                    window.location.reload();
                }
            });

            this.layout.score.textContent = 0;
            this.layout.start.style.opacity = '1';

            this.tick = this.tick.bind(this);
        });
    }

    start() {
        // dessine la scene
        this.started = true;
        this.layout.start.style.opacity = '0';

        this.spaceships.push(new J1(0, -0.8, this.lifes, this.lasers));

        setInterval(() => {
            console.log(this.fps);
            this.fps = 0;
        }, 1000);

        this.tick();

        this.bonus.push(new Formation(0, 3, this.enemies));
    }

    end() {
        this.paused = true;
        this.ended = true;

        this.scoreBoard.push(this.totalScore);
        const scoreBoard = this.scoreBoard.sort((a,b) => a < b).filter(e => e > 0).reduce((acc, e) => {
            if (!~acc.indexOf(e)) acc.push(e);
            return acc;
        }, []).slice(0, 5);
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
        this.drawScore(number);
    }

    pause() {
        this.paused = !this.paused;
        if (false === this.paused) {
            requestAnimationFrame(this.tick);
        }
        return this.paused;
    }

    onKeyDown(event) {
        this.keys[event.keyCode] = true;
        !!this.keys[this.controls.pause] && this.pause();
        if (!!this.keys[this.controls.sound]) {
            this.audio = !this.audio;
        }
    }

    onKeyUp(event) {
        this.keys[event.keyCode] = false;
    }

    tick() {
        if (this.paused) return;
        ++this.fps;
        ++this.ticks;
        this.draw();
        this.update();
        requestAnimationFrame(this.tick);
    }

    drawScore(number) {
        this.layout.score.textContent = this.totalScore;
        const node = this.layout.upscore.cloneNode(true);
        node.innerHTML = number < 0 ? number : `<span class="arial">+</span>${number}`;
        node.style.color = number < 0 ? 'red' : 'green';
        node.style.left = 50 + String(this.totalScore).length * 10;
        this.layout.layout.appendChild(node);
        setTimeout(() => {
            this.layout.layout.removeChild(node);
        }, 2000);
    }

    drawLifes() {
        while (this.layout.life.firstChild) this.layout.life.removeChild(this.layout.life.firstChild);
        const left = this.lifes.left;
        const loss = this.lifes.loss;
        for (let i = 0; i < left; ++i) {
            this.layout.life.appendChild(this.layout.fullLife.cloneNode(true));
        }
        for (let i = 0; i < loss; ++i) {
            this.layout.life.appendChild(this.layout.emptyLife.cloneNode(true));
        }
    }

    update() {

        // keep the actual score for playing animations only when score change
        const scoreNow = this.totalScore;
        const lifeNow = this.lifes.left;

        // ticks relative to the time speed
        const relativeTicks = this.ticks * this.timeSpeed;

        this.heightfield.update(relativeTicks, this.keys, this);
        this.background.update(relativeTicks, this.keys, this);

        let i;

        i = this.spaceships.length;
        while (i--) {
            if (this.spaceships[i].update(relativeTicks, this.keys, this)) {
                // game over no more lifes
                this.end();
                return;
            }
        }

        i = this.enemies.length;
        while (i--) {
            if (this.enemies[i].update(relativeTicks, this.keys, this)) {
                this.enemies.splice(i, 1);
            }
        }

        i = this.lasers.length;
        while (i--) {
            if (this.lasers[i].update(relativeTicks, this.keys, this)) {
                this.lasers.splice(i, 1);
            }
        }

        i = this.enemyLasers.length;
        while (i--) {
            if (this.enemyLasers[i].update(relativeTicks, this.keys, this)) {
                this.enemyLasers.splice(i, 1);
            }
        }

        i = this.bonus.length;
        while (i--) {
            if (this.bonus[i].update(relativeTicks, this.keys, this)) {
                this.bonus.splice(i, 1);
            }
        }

        //const enemyRate = Math.max(Game.enemyRate - Math.floor(this.timer / 10), 5)
        if(0 === relativeTicks % Game.enemyRate) {
            this.enemies.push(new Enemy(Math.random() - Math.random(), 1.1, Math.random(), this.enemyLasers));
        }

        if (this.totalScore !== scoreNow
            && Math.floor(this.totalScore / Game.bonusRate) > Math.floor(scoreNow / Game.bonusRate)) {
            const type =  Game.bonus[Math.floor(Math.random() * Game.bonus.length)];
            this.bonus.push(new type(Math.random() - Math.random(), Bonus.verticalSpeed));
        }

        if (this.lifes.left !== lifeNow) {
            this.drawLifes();
        }
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
            for (let i = 0; i < this.enemies.length; ++i) {
                this.enemies[i].draw();
            }
        }

        if (this.bonus.length) {
            gl.useProgram(Bonus.shader);
            for (let i = 0; i < this.bonus.length; ++i) {
                this.bonus[i].draw();
            }
        }

        if (this.enemyLasers.length) {
            gl.useProgram(EnemyLaser.shader);
            for (let i = 0; i < this.enemyLasers.length; ++i) {
                this.enemyLasers[i].draw();
            }
        }

        // dessin du vaisseau (shader par defaut ici)
        gl.useProgram(Spaceship.shader);
        for (let i = 0; i < this.spaceships.length; ++i) {
            this.spaceships[i].draw();
        }

        if (this.lasers.length) {
            gl.useProgram(Laser.shader);
            for (let i = 0; i < this.lasers.length; ++i) {
                this.lasers[i].draw();
            }
        }
    }

}

Game.enemyRate = 30;
Game.bonusRate = 1000;