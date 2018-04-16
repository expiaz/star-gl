class InvincibleBonus extends Bonus {

    texture() {
        return InvincibleBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        this.ticks = 0;
        this.target = target;

        this.snapshot = {
            life: target.life,
            speed: target.speed,
            lasers: target.lasers,
            fireRate: target.fireRate,
            fireSpeed: target.fireSpeed
        };

        target.flicker = 100;
        target.currentTexture = Spaceship.textureHit;
        target.life =  Spaceship.MAX_LIFES;
        target.speed = Spaceship.MAX_SPEED;
        target.lasers = Spaceship.MAX_LASERS;
        target.fireRate = Spaceship.MAX_FIRE_RATE;
        target.fireSpeed = Spaceship.MAX_FIRE_SPEED;
    }

    active(elapsed, keys, globals) {
        this.target.flicker = 100;

        if (!this.ticks) {
            this.ticks = elapsed;
        } else if (elapsed - this.ticks > options.spaceship.bonus.invincible) {
            this.target.currentTexture = Spaceship.texture;
            this.target.life = this.snapshot.life;
            this.target.speed = this.snapshot.speed;
            this.target.lasers = this.snapshot.lasers;
            this.target.fireRate = this.snapshot.fireRate;
            this.target.fireSpeed = this.snapshot.fireSpeed;
            return true;
        }
        return false;
    }

}

InvincibleBonus.init = function (textures) {
    InvincibleBonus.texture = textures[18];
}

InvincibleBonus.rate = options.bonus.rates.invincible;
