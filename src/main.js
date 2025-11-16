import { Start } from './scenes/Start.js';
import { Level_one } from './scenes/Level_one.js';
import { Level_two } from './scenes/Level_two.js';

const config = {
    type: Phaser.AUTO,
    title: 'CMPM 120 Project Skeleton',
    description: '',
    parent: 'game-container',
    width: 512,
    height: 256,
    backgroundColor: '#000000',
    pixelArt: false,
    physics: {default: "arcade", 
        //arcade:{debug:true}
    },
    scene: [
        Start,
        Level_one,
        Level_two
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            