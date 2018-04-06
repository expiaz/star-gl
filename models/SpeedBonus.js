class SpeedBonus extends Bonus {

    texture() {
        return SpeedBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        target.fireSpeed += Spaceship.fireSpeedBonus;
        target.speed += Spaceship.speedBonus;
    }

}

SpeedBonus.rate = 10;

SpeedBonus.init = function (textures) {
    SpeedBonus.texture = textures[4];
}