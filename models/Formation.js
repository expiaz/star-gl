class Formation extends Bonus {

    constructor(x, nb) {
        super(x, 0);
        this.activated = true;
        this.nb = nb;
        this.i = 0;
    }

    update(ticks, keys, globals) {
        super.update(ticks, keys, globals);

        if (this.i === this.nb) return true;

        if (0 === ticks % 8) {
            let i = ++this.i;
            let offset = 0;
            if (Utils.pair(i)) {
                // offset less bc no middle enemy
                offset -= 0.075;
            } else { // impair, one at 0
                // i must be pair bc we'll add enenmies 2 by 2
                --i;
                // add the middle enemy
                globals.enemies.push(new Enemy(this.x, 1.1, 0, globals.enemyLasers));
            }
            i = i / 2;
            for (; i > 0; --i) {
                globals.enemies.push(new Enemy(this.x - (offset + 0.15 * i), 1.1, 0, globals.enemyLasers));
                globals.enemies.push(new Enemy(this.x + (offset + 0.15 * i), 1.1, 0, globals.enemyLasers));
            }
        }

        return false;
    }

}
