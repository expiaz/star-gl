/**
 * options globales du jeu
 * si valeur < 1 => coordonnée entre -1 et 1
 * si valeur < 100 => nombre de frames (60 ~= 1s)
 * sinon nombre de points
 * sauf pour controls : code ascii des touches
 */

const options = {

    mute: false,
    time: {
        base: 1,
        max: 2,
        min: 0.1,
        rate: 60,
        value: 0.01
    },

    controls: {
        mute: 'M',
        pause: 'P',
        players: [
            // P1
            {
                left: 81,
                right: 68,
                top: 90,
                bottom: 83,
                fire: 32
            },
            // P2
            {
                left: 37,
                right: 39,
                top: 38,
                bottom: 40,
                fire: 13
            }
        ]
    },

    world: {
        x: {
            min: -1,
            max: 1
        },
        y: {
            min: -1,
            max: 1
        }
    },

    bonus: {
        rate: 1000, // tout les 1k points => 1 bonus pop
        speed: 0.02, // vitesse y du bonus
        z: -0.5, // z buffer
        rates: {
            invincible: 1, // 1 chance / nombre total de rate de tomber
            laser: 4, // 3 chance
            speed: 3, // 10 chances
            life: 5, // 10 chances
            time: 2 // 2 chances
        },
        time: {
            invincible: 60 * 5, // ~5s
            time: 60 * 10 // ~10s
        },
        value: {
            laser: 2, // nombre de lasers
            speed: 0.02, // vitesse x,y
            life: 1, // nombre de vies
            time: 0.5, // reduction du timeSpeed
            lasers: {
                rate: -5, // nombre de frame
                speed: 0.01, // position x,y
            }
        },
        max: { // valeurs max
            laser: 8, // nb lasers vaisseau
            life: 10, // nb vie vaisseau
            speed: 0.05, // vitesse x,y
            lasers: {
                rate: 5, // fire rate du vaisseau
                speed: 0.1 // fire speed du vaisseau
            }
        }
    },

    enemy: {
        rate: 60, // toutes les 60 frames
        speed: 0.015, // vitesse y
        points: 100, // score lorsque détruit
        explosion: 5, // vitesse d'explosion en frame
        z: -0.5, // z buffer
        lasers: {
            speed: 0.02, // vitesse -y
            rate: 60, // fire speed en frames
            points: 10, // nb de points lorsque détruit
            z: -0.8 // z buffer
        },
        formation: {
            max: 5, // taille max de la formation
            min: 2, // taille min de la formation
            rate: 1/2 // [0,1] chance de spawn a chaque spawn de bonus
        }
    },

    spaceship: {
        max: { // valeurs max
            laser: 8, // nb lasers vaisseau
            life: 10, // nb vie vaisseau
            speed: 0.05, // vitesse x,y
            lasers: {
                rate: 5, // fire rate du vaisseau
                speed: 0.1 // fire speed du vaisseau
            }
        },
        bonus: { // valeurs ajoutées lors de bonus
            laser: 2, // nombre de lasers
            speed: 0.02, // vitesse x,y
            life: 1, // nombre de vies
            time: 0.5, // reduction du timeSpeed
            invincible: 60 * 5, // nombre de frames
            lasers: {
                rate: -5, // nombre de frame
                speed: 0.01, // position x,y
            }
        },
        // valeur de base
        laser: 2,
        life: 3,
        speed: 0.02,
        z: -0.6,
        lasers: {
            rate: 20,
            speed: 0.03,
            z: -0.8
        }
    },

    background: {
        items: {
            z: -0.1,
            rate: 400,
            speed: 0.004
        }
    }

};
