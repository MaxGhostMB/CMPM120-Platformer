export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
        this.load.spritesheet('player', 'assets/froggy-green.png', {frameWidth: 16, frameHeight: 17});
    }

    create() {
        this.background = this.add.sprite(640, 320, 'background');
        this.last_time = 0;
        
        this.player = this.physics.add.sprite(50,100,'player',1);
        this.player.setScale(4);

        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, true, true);
        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, true, true);
        this.left = this.input.keyboard.addKey("A", true, true);
        this.right = this.input.keyboard.addKey("D", true, true);

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 7,
            repeat: -1
        });
        this.anims.create({
            key: 'moving',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update(time) {
        let dt = (time - this.last_time)/1000;
        this.last_time = time;

        this.player.body.setVelocityX(0);

        if (this.left.isDown && !(this.right.isDown))
        {
            this.player.body.setVelocityX(-300);
            this.player.setFlipX(true);
        }
        else if (this.right.isDown && !(this.left.isDown))
        {
            this.player.body.setVelocityX(300);
            this.player.setFlipX(false);
        }

        if(!(this.left.isDown || this.right.isDown)) {
            this.player.anims.play('idle',true);
        } else {
            this.player.anims.play('moving',true);
        }
        
    }
    
}
