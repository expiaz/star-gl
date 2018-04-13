PROJET SPACE INVADERS 3.0

## 9/03/18 - Rémi - Gros refacto
**Organisation en classes**
- tout les objets dans models/*
- la logique du jeu dans Game.js
- spaceship.html devient index.html pour plus de simplicité.
- Toutes les classes partagent une interface commune permettant
une simplicité d'implémentation de nouveaux acteurs.

## 15/03/18 - Rémi - Layout + Interactions
- ajout des animations lorsque le vaisseau est touché
- ajout du style css pour le layout
- ajout de la structure HTML pour le layout
- ajout du score, des controles et des vies
- ajout de l'écran de début et de fin

## 13/04/18 - Rémi - Commentaires + Options globals
- Game.js, Actor.js, Bonus.js commentés
- options.js contient toutes les options du jeu
