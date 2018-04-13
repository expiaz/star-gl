class LifeBonus extends Bonus {

    texture() {
        return LifeBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        target.life += options.spaceship.bonus.life;
    }

}

LifeBonus.rate = 5;

LifeBonus.init = function (textures) {
    LifeBonus.texture = textures[19];
};

LifeBonus.rate = options.bonus.rates.life;
