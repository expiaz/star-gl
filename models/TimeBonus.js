class TimeBonus extends Bonus {

    texture() {
        return TimeBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        this.timer = 1000;
        globals.timeSpeed -= options.spaceship.bonus.time;
    }

    active(ticks, keys, globals) {
        this.timer -= 10;
        if (this.timer <= 0) {
            globals.timeSpeed += options.spaceship.bonus.time;
            return true;
        }
        return false;
    }

}

TimeBonus.rate = options.bonus.rates.time;

TimeBonus.init = function (textures) {
    TimeBonus.texture = textures[14];
};
