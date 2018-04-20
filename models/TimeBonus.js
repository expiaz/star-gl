class TimeBonus extends Bonus {

    texture() {
        return TimeBonus.texture;
    }

    collected(target, globals) {
        super.collected(target, globals);
        this.aborted = globals.timeSpeed - options.bonus.value.time <= options.time.min ||
            globals.timeSpeed + options.bonus.value.time >= options.time.max;
        this.startAt = 0;
    }

    active(ticks, keys, globals) {
        if (this.aborted) {
            return true;
        }

        if (!this.startAt) {
            this.startAt = ticks;
            // 1/2 chance de ralentir ou augmenter
            this.increase = Math.random() > 1/2
                ? -options.bonus.value.time
                : options.bonus.value.time;
            globals.timeSpeed += this.increase;
        } else if (ticks - this.startAt > options.bonus.time.time) {
            globals.timeSpeed -= this.increase;
            return true;
        }
        return false;
    }

}

TimeBonus.rate = options.bonus.rates.time;

TimeBonus.init = function (textures) {
    TimeBonus.texture = textures[14];
};
