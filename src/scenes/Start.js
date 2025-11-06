export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
        this.load.spritesheet('player', 'assets/froggy-green.png', {frameWidth: 16, frameHeight: 16});
    }

    create() {
        this.background = this.add.sprite(640, 320, 'background');
        this.last_time = 0;
        
        this.player = this.physics.add.sprite(50,100,'player',1);
        this.player.setScale(4);
    }

    update(time) {
        let dt = (time - this.last_time)/1000;
        this.last_time = time;
        
    }
    
}
