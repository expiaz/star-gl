class SpaceshipHit extends Actor {

  constructor(x, y, velocity, width = 0.02, height = 0.066) {
    super(0.2, 0.2, x, y, SpaceshipHit.z);
    this.timeElapsedSinceLastFire = +Date.now()
    this.fireRate = 4;
    this.verticalSpeed = 0.02;
    this.horizontalSpeed = 0.02;
    this.fireSpeed = 500;
    this.life = 3;

    this.flicker = 0;

    this.currentTexture = SpaceshipHit.texture;
  }

  shader() {
    return Spaceship.shader;
  }

  texture() {
    return SpaceshipHit.texture;
  }
  /**
  *
  * @param {Number} elapsed
  * @param {Object} keys
  * @param {Game} globals
  * @return {Boolean} is out of bounds or not
  */
  update(elapsed, keys, globals) {
    if (super.update(elapsed, keys, globals)) {
      // dead by another object
      return true;
    }

    const bounds = this.bounds();

    if (keys[81]) { // left arrow
      let nextX = this.x - this.horizontalSpeed;
      if (nextX < bounds.left) {
        nextX = bounds.left;
      }
      this.x = nextX;
    }
    if (keys[68]) { // right arrow
      let nextX = this.x + this.horizontalSpeed;
      if (nextX > bounds.right) {
        nextX = bounds.right;
      }
      this.x = nextX;
    }
    if (keys[90]) { // up arrow
      let nextY = this.y + this.verticalSpeed;
      if (nextY > bounds.top) {
        nextY = bounds.top;
      }
      this.y = nextY;
    }
    if (keys[83]) { // down arrow
      let nextY = this.y - this.verticalSpeed;
      if (nextY < bounds.bottom) {
        nextY = bounds.bottom;
      }
      this.y = nextY;
    }

    if (keys[32]) { // space
      this.fire(globals.lasers);
    }

    return false;
  }

}

SpaceshipHit.z = -0.6;

SpaceshipHit.init = function (textures) {
  SpaceshipHit.texture = textures[1];
  SpaceshipHit.shader = Spaceship.shader;
}
