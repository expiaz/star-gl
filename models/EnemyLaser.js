class EnemyLaser extends Actor {

    constructor(x, y, velocity) {
        super(0.02, 0.066, x, y, options.enemy.lasers.z);
        this.velocity = velocity;
    }

    shader() {
        return Laser.shader;
    }

    texture() {
        return EnemyLaser.texture;
    }

    update(ticks, keys, globals) {
        if (super.update(ticks, keys, globals)) {
            return true;
        }

        this.y -= globals.timeSpeed * this.velocity;
        return this.y < World.MIN_Y;
    }

}

EnemyLaser.init = function (textures) {

    EnemyLaser.texture = textures[4];

    EnemyLaser.shader = Laser.shader;
}
