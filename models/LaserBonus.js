class LaserBonus extends Bonus {

    texture() {
        return LaserBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        target.lasers += options.spaceship.bonus.laser;
        target.fireRate += options.spaceship.bonus.lasers.rate;
    }

}

LaserBonus.rate = 10;

LaserBonus.init = function (textures) {
    LaserBonus.texture = textures[3];
};

LaserBonus.rate = options.bonus.rates.laser;
