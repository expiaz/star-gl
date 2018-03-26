class LaserBonus extends Bonus {

    texture() {
        return LaserBonus.texture;
    }

    collected(globals) {
        super.collected(globals);
        globals.spaceship.lasers += 2;
    }

}

LaserBonus.init = function (textures) {
    LaserBonus.texture = textures[3];
}

LaserBonus.rate = 3;
