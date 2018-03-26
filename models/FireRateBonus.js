class FireRateBonus extends Bonus {

    texture() {
        return FireRateBonus.texture;
    }

    collected(globals) {
        super.collected(globals);
        globals.spaceship.fireRate += 5;
    }

}

FireRateBonus.init = function (textures) {
    FireRateBonus.texture = textures[4];
}

FireRateBonus.rate = 3;
