export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
        this.load.spritesheet('player', 'assets/froggy-green.png', {frameWidth: 16, frameHeight: 17});
        this.load.image('monochrome_tilemap', 'assets/kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap.png');
        this.load.tilemapTiledJSON('map', 'assets/Bare_bones.tmj');
    }

    create() {
        this.last_time = 0;
        this.physics.world.TILE_BIAS = 32;

        this.map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('monochrome_tilemap');

        this.bglayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.platlayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        this.obslayer = this.map.createLayer("Obstacals", this.tileset, 0, 0);
        //this.map.setCollision([ 20, 48 ]);
        
        this.player = this.physics.add.sprite(50,200,'player',1);
        //this.player.setScale(4);
        this.player.setDepth(2);

        this.platlayer.setCollisionBetween(1,1767);
        this.physics.add.collider(this.platlayer, this.player);


        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, true, true);
        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, true, true);
        this.left = this.input.keyboard.addKey("A", true, true);
        this.right = this.input.keyboard.addKey("D", true, true);

        this.coyote = 0;
        this.grounded = false;

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 5,
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

        //Movement Handling
        this.player.body.setVelocityX(0);

        if (this.left.isDown && !(this.right.isDown))
        {
            this.player.body.setVelocityX(-200);
            this.player.setFlipX(true);
        }
        else if (this.right.isDown && !(this.left.isDown))
        {
            this.player.body.setVelocityX(200);
            this.player.setFlipX(false);
        }

        //Coyote Time
        if(!this.player.body.blocked.down)
        {
            this.coyote -= dt;
            if(this.coyote < 0) {
                this.grounded = false;
            }
        } else {
            this.coyote = 0.1;
            this.grounded = true;
        }

        //Gravity
        if(this.grounded) { 
            this.player.body.setGravityY(0);
        } else if(this.player.body.velocity.y > 0) {
            this.player.body.setGravityY(800);
        } else {
            this.player.body.setGravityY(600);
        }

        //Animation Handling
        if(!(this.left.isDown || this.right.isDown)) {
            this.player.anims.play('idle',true);
        } else {
            this.player.anims.play('moving',true);
        }
        
    }
    
}
