import { Start } from './scenes/Start.js';
import { Level_one } from './scenes/Level_one.js';
import { Level_two } from './scenes/Level_two.js';
import { Level_Secret } from './scenes/Level_Secret.js';
import { End } from './scenes/End_of_Game.js';

const config = {
    type: Phaser.AUTO,
    title: 'CMPM 120 Project Skeleton',
    description: '',
    parent: 'game-container',
    width: 384,
    height: 192,
    backgroundColor: '#000000',
    pixelArt: false,
    physics: {default: "arcade", 
        arcade:{debug:true}
    },
    scene: [
        Start,
        Level_one,
        Level_two,
        Level_Secret,
        End

    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            