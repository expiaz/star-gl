class EnemyLaser extends Laser {

    constructor(x, y, velocity) {
        super(x, y, EnemyLaser.z, 0.02, 0.066);
        this.velocity = velocity;
    }

    update(elapsed, keys) {
        this.y -= elapsed / this.velocity;
        return this.y <= World.MIN_Y;
    }

}

EnemyLaser.z = -0.7;