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
            'img/island.png',
        ]).then(textures => {
            // init all the actors
            Heightfield.init(textures);
            Background.init(textures);
            Spaceship.init(textures);
            Enemy.init(textures);
            Laser.init(textures);
            EnemyLaser.init(textures);
            Bonus.init(textures);
            Island.init(textures);

            Game.bonus = Utils.shuffle([
                LifeBonus,
                LaserBonus,
                SpeedBonus,
                InvincibleBonus,
                // TimeBonus
            ].reduce(
                (all, bonus) => all.concat(new Array(bonus.rate || 1).fill(bonus)),
                []
            ));

            /**
             * @type {Laser[]}
             */
            this.lasers = [];
            /**
             * @type {EnemyLaser[]}
            */
            this.enemyLasers = [];
            /**
             * @type {Enemy}
             */
            this.enemies = [];
            /**
             * @type {Bonus[]}
             */
            this.bonus = [];
            /**
             * @type {Spaceship[]}
             */
            this.spaceships = [];
            /**
             * @type {Island[]}
             */
            this.island = [];

            // for the procedural background
            this.fbo = new FBO(canvas.width, canvas.height, 1, false);
            this.heightfield = new Heightfield();
            this.background = new Background(this.fbo.texture(0));

            this.fps = 0;
            // used to accelerate or diminize moving objects (and game speed)
            this.timeSpeed = 1;
            // spawn rate on points for bonus
            this.bonusRate = options.bonus.rate;
            // spawn rate on frames for enemy
            this.enemyRate = options.enemy.rate;

            // ticks elapsed since game started
            this.ticks = 0;
            // player score
            this.totalScore = 0;
            // pressed keys
            this.keys = {};

            this.controls = {
                pause: options.controls.pause.charCodeAt(0),
                sound: options.controls.mute.charCodeAt(0)
            };

            // play the sounds or mute
            this.audio = !options.mute;
            // re-draw game
            this.paused = false;
            // game finished
            this.ended = false;
            // game started
            this.started = false;

            // final score board
            this.scoreBoard = JSON.parse(localStorage.getItem('star-gl') || '[]');

            // DOM object to update game layout (not in canvas)
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

            /*
             * INIT
             */

            this.layout.layout.removeChild(this.layout.upscore);
            this.lifes = new Utils.Lifes(Spaceship.lifes, Spaceship.MAX_LIFES);
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
                    // F5 when finished
                    window.location.reload();
                }
            });

            this.layout.score.textContent = '0';
            this.layout.start.style.opacity = '1';

            this.tick = this.tick.bind(this);
        });
    }

    start() {
        // first draw
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
        const scoreBoard = this.scoreBoard.sort((a,b) => a < b)
            .filter(e => e > 0)
            .reduce((acc, e) => {
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
        this.layout.end
            .querySelector('.playerscore').textContent = this.totalScore;

        this.layout.end.style.opacity = '1';
    }

    /**
     * @param {Number} number the points to add
     */
    score(number) {
        this.totalScore += number;
        if (this.totalScore < 0) {
            this.totalScore = 0;
        }
        // play score animation
        this.drawScore(number);
    }

    /**
     * toggle pause
     * @return {Boolean} paused
     */
    pause() {
        this.paused = !this.paused;
        if (false === this.paused) {
            // restart
            requestAnimationFrame(this.tick);
        }
        return this.paused;
    }

    onKeyDown(event) {
        this.keys[event.keyCode] = true;
        // on pause
        !!this.keys[this.controls.pause] && this.pause();
        // on mute
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
        // play score animation
        const node = this.layout.upscore.cloneNode(true);
        node.innerHTML = number < 0
            ? number
            : `<span class="arial">+</span>${number}`;
        node.style.color = number < 0 ? 'red' : 'green';
        node.style.left = `${50 + String(this.totalScore).length * 10}`;
        this.layout.layout.appendChild(node);
        setTimeout(() => {
            this.layout.layout.removeChild(node);
        }, 2000);
    }

    drawLifes() {
        while (this.layout.life.firstChild) {
           this.layout.life.removeChild(this.layout.life.firstChild);
        }
        const left = this.lifes.left;
        const loss = this.lifes.loss;
        for (let i = 0; i < left; ++i) {
            this.layout.life.appendChild(
                this.layout.fullLife.cloneNode(true)
            );
        }
        for (let i = 0; i < loss; ++i) {
            this.layout.life.appendChild(
                this.layout.emptyLife.cloneNode(true)
            );
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

        // while is used here instead of for because of splice
        // when splicing an array at index i, the next element will be i+2
        // so i+1 will be skipped
        // by iterating over the array from the end, when splicing a i,
        // i+1 is removed and becomes i+2 but we move the i-1 bc we iterate
        // backward so we don't care

        // also, before Array.prototype.filter was used, but for permormance
        // reasons (instantiate 5 arrays each frame), we moved to iterating
        // event if splice may cause the same issues

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

        i = this.island.length;
        while (i--) {
            if (this.island[i].update(relativeTicks, this.keys, this)) {
                this.island.splice(i, 1);
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

        // TODO inscrease the spawn rate over time
        if(0 === relativeTicks % this.enemyRate) {
            this.enemies.push(new Enemy(
                Math.random() - Math.random(),
                1.1,
                Math.random(),
                this.enemyLasers
            ));
        }

        if(0 === relativeTicks % Game.islandRate) {
            this.island.push(new Island(Math.random() - Math.random(), 1.1, 0.004));
        }

        if (this.totalScore !== scoreNow &&
            Math.floor(
                this.totalScore / this.bonusRate
            ) > Math.floor(
              scoreNow / this.bonusRate
            )) {
            // get a random Bonus class
            const type =  Game.bonus[Math.floor(
                Math.random() * Game.bonus.length
            )];
            // instaniate it
            this.bonus.push(new type(
                Math.random() - Math.random(),
                options.bonus.speed
            ));
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

        if (this.island.length) {
            gl.useProgram(Island.shader);
            for (let i = 0; i < this.island.length; ++i) {
                console.log('draw');
                this.island[i].draw();
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
Game.islandRate = 400;
Game.bonusRate = 1000;
