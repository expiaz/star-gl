class InvincibleBonus extends Bonus {

    texture() {
        return InvincibleBonus.texture;
    }

    collected(globals) {
        super.collected(globals);
        this.ticks = 0;

        globals.spaceship.currentTexture = Spaceship.textureHit;
        globals.spaceship.life =  Spaceship.MAX_LIFES;;
        globals.spaceship.speed = Spaceship.MAX_SPEED;
        globals.spaceship.lasers = Spaceship.MAX_LASERS;
        globals.spaceship.fireRate = Spaceship.MAX_FIRE_RATE;
    }

    active(elapsed, keys, globals) {
        globals.spaceship.filcker = 100;

        const finished = this.ticks > 100;
        if (finished) {
            globals.spaceship.currentTexture = Spaceship.texture;
            globals.spaceship.life =  Spaceship.lifes;
            globals.spaceship.speed = Spaceship.speed;
            globals.spaceship.lasers = Spaceship.lasers;
            globals.spaceship.fireRate = Spaceship.fireRate;
        }

        return finished;
    }

}

InvincibleBonus.init = function (textures) {
    InvincibleBonus.texture = textures[18];
}

InvincibleBonus.rate = 1;
