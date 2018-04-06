class LaserBonus extends Bonus {

    texture() {
        return LaserBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        target.lasers += Spaceship.lasersBonus;
        target.fireSpeed += Spaceship.fireSpeedBonus;
    }

}

LaserBonus.rate = 10;

LaserBonus.init = function (textures) {
    LaserBonus.texture = textures[3];
}