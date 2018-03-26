class SpeedBonus extends Bonus {

    texture() {
        return SpeedBonus.texture;
    }

    collected(globals) {
        super.collected(globals);
        globals.spaceship.speed += 0.02;
    }

}

SpeedBonus.init = function (textures) {
    SpeedBonus.texture = textures[14];
}

LifeBonus.rate = 7;
