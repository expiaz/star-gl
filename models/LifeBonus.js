class LifeBonus extends Bonus {

    texture() {
        return LifeBonus.texture;
    }

    collected(globals) {
        super.collected(globals);
        globals.spaceship.life += 1;
    }

}

LifeBonus.init = function (textures) {
    LifeBonus.texture = textures[19];
}

LifeBonus.rate = 10;
