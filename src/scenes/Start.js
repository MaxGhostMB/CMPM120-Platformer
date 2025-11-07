import { Player } from '../gameobjects/Player.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
        this.load.spritesheet('player', 'assets/froggy-green.png', {frameWidth: 16, frameHeight: 17});
        this.load.image('monochrome_tilemap', 'assets/kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap.png');
        this.load.tilemapTiledJSON('map', 'assets/Bare_bones.tmj');
        this.load.tilemapTiledJSON('tutorial_map', 'assets/Tutorial.tmj');
    }

    create() {
        this.last_time = 0;
        this.physics.world.TILE_BIAS = 32;

        this.map = this.make.tilemap({ key: 'tutorial_map', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('monochrome_tilemap');

        // Make all layers
        this.bglayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.wallayer = this.map.createLayer("Walls", this.tileset, 0, 0);
        this.platlayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        this.obslayer = this.map.createLayer("Obsticals", this.tileset, 0, 0);
        this.declayer = this.map.createLayer("Decor", this.tileset, 0, 0);
        this.doorlayer = this.map.createLayer("Doors", this.tileset, 0, 0);
        this.doorlayer = this.map.createLayer("Items", this.tileset, 0, 0);
        
        // Collision
        this.platlayer.setCollisionBetween(1,1767);
        this.wallayer.setCollisionBetween(1,1767);
        
        // Create a player
        this.player = new Player(this, 100, 410, 'player', 1);
        this.player.setDepth(2);
        this.physics.add.collider(this.platlayer, this.player);
        this.physics.add.collider(this.wallayer, this.player);

        // Camera follows player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1);

        // Set camera bounds to map size
        this.cameras.main.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );
    }

    update(time) {
        let dt = (time - this.last_time)/1000;
        this.last_time = time;
        this.player.update(dt);
    }
}
