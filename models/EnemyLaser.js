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

        if (globals.spaceship.cross(this)) {
            this.die();
            globals.spaceship.hit();
            globals.score(- EnemyLaser.points * 10);
            return true;
        }

        this.y -= elapsed / this.velocity;
        return this.y < World.MIN_Y;
    }

}

EnemyLaser.points = 10;

EnemyLaser.z = -0.8;

EnemyLaser.init = function (textures) {

    EnemyLaser.texture = Laser.texture;

    EnemyLaser.shader = Laser.shader;
}
