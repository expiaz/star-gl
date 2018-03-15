class EnemyLaser extends Actor {

    constructor(x, y, velocity, width = 0.02, height = 0.066) {
        super(width, height, x, y, EnemyLaser.z);
        this.velocity = velocity;
    }

    shader() {
        return Laser.shader;
    }

    texture() {
        return Laser.texture;
    }

    update(elapsed, keys, globals) {
        if (super.update(elapsed, keys, globals)) {
            return true;
        }

        if (this.cross(globals.spaceship)) {
            this.die();
            globals.spaceship.hit();
            return true;
        }

        this.y -= elapsed / this.velocity;
        return this.y < World.MIN_Y;
    }

}

EnemyLaser.z = -0.8;

EnemyLaser.init = function (textures) {

    EnemyLaser.texture = Laser.texture;

    EnemyLaser.shader = Laser.shader;
}
