class TimeBonus extends Bonus {

    texture() {
        return TimeBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        this.timer = 1000;
        globals.timeSpeed -= 0.2;
    }

    active(ticks, keys, globals) {
        this.timer -= 10;
        if (this.timer <= 0) {
            globals.timeSpeed = 1.0;
            return true;
        }
        return false;
    }

}

TimeBonus.rate = 100;

TimeBonus.init = function (textures) {
    TimeBonus.texture = textures[14];
}