class EnemyLaser extends Actor {

    constructor(x, y, velocity, width = 0.02, height = 0.066) {
        super(width, height, x, y, options.enemy.lasers.z);
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
