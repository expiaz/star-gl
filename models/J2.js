class J2 extends Spaceship {

    constructor(x, y, lifes, lasers) {
        super(x, y, lifes, lasers, {
            left: 37,
            right: 39,
            top: 38,
            bottom: 40,
            fire: 13
        });
    }

}