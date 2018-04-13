class SpeedBonus extends Bonus {

    texture() {
        return SpeedBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        target.fireSpeed += options.spaceship.bonus.lasers.speed;
        target.speed += options.spaceship.bonus.speed;
    }

}

SpeedBonus.rate = options.bonus.rates.speed;

SpeedBonus.init = function (textures) {
    SpeedBonus.texture = textures[4];
};
