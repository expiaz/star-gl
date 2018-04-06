class InvincibleBonus extends Bonus {

    texture() {
        return InvincibleBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        this.ticks = 0;
        this.target = target;

        target.currentTexture = Spaceship.textureHit;
        target.life =  Spaceship.MAX_LIFES;;
        target.speed = Spaceship.MAX_SPEED;
        target.lasers = Spaceship.MAX_LASERS;
        target.fireRate = Spaceship.MAX_FIRE_RATE;
    }

    active(elapsed, keys, globals) {
        this.target.filcker = 100;

        const finished = this.ticks > 100;
        if (finished) {
            this.target.currentTexture = Spaceship.texture;
            this.target.life =  Spaceship.lifes;
            this.target.speed = Spaceship.speed;
            this.target.lasers = Spaceship.lasers;
            this.target.fireRate = Spaceship.fireRate;
        }

        return finished;
    }

}

InvincibleBonus.init = function (textures) {
    InvincibleBonus.texture = textures[18];
}

InvincibleBonus.rate = 1;
