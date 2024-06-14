// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            tileBias: 12,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    fps: { target: 60, forceSetTimeOut: true },
    width: 1440,
    height: 900,
    scene: [Load, Platformer, endScene, startScene, Tutorial, failScene, Platformer2, lifeScene, creditsScene]
}

var cursors;
const SCALE = 4.0;
var my = { sprite: {}, text: {}, vfx: {} };

const game = new Phaser.Game(config);