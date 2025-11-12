import { Player } from '../gameobjects/Player.js';

export class Level_one extends Phaser.Scene {

    constructor() {
        super('Level_one');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
        this.load.spritesheet('player', 'assets/froggy-green.png', {frameWidth: 16, frameHeight: 17});
        this.load.spritesheet('vapor', 'assets/vapor_cloud.png', {frameWidth: 128, frameHeight: 128});
        this.load.image('monochrome_tilemap', 'assets/kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap.png');
        this.load.tilemapTiledJSON('map', 'assets/Bare_bones.tmj');
        this.load.tilemapTiledJSON('Level_1_map', 'assets/LevelOne.tmj');
    }

    create() {
        this.last_time = 0;
        this.physics.world.TILE_BIAS = 16;

        this.map = this.make.tilemap({ key: 'Level_1_map', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('monochrome_tilemap');

        // Make all layers
        this.bglayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.wallayer = this.map.createLayer("Walls", this.tileset, 0, 0);
        this.platlayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        this.obslayer = this.map.createLayer("Obsticals", this.tileset, 0, 0);
        this.declayer = this.map.createLayer("Decor", this.tileset, 0, 0);
        this.doorlayer = this.map.createLayer("Doors", this.tileset, 0, 0);
        this.itemlayer = this.map.createLayer("Items", this.tileset, 0, 0);
        
        // Collision
        this.platlayer.setCollisionBetween(1,1767);
        this.wallayer.setCollisionBetween(1,1767);
        this.doorlayer.setCollision(58);

        //this.locked = this.physics.add.staticGroup();

        //Determine Spawnpoint
        let spawnpoint = [0,0]
        this.doorlayer.forEachTile(element => {
           if(element.index == 60) {
                spawnpoint[0] = element.x * 16 + 8;
                spawnpoint[1] = element.y * 16 + 8;
                // console.log("X: " + (element.x * 16 + 8) + "Y: " + (element.y * 16 + 8))
           }

        });
        // console.log("Spawnpoint: " + spawnpoint)
        
        // Create a player
        this.player = new Player(this, spawnpoint[0], spawnpoint[1], 'player', 1);
        this.player.setDepth(2);
        this.physics.add.collider(this.platlayer, this.player);
        this.physics.add.collider(this.wallayer, this.player);
        this.keyCollected = false;

        // Camera follows player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1);
        this.cameras.main.setRoundPixels(true);

        // Set camera bounds to map size
        this.cameras.main.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );

        // Pickup logic:
        this.pickups = this.physics.add.staticGroup();

        this.map.forEachTile(tile => {
            if(tile.layer.name === 'Items' && tile.index !== -1) { 
                const x = tile.getCenterX();
                const y = tile.getCenterY();

                const pickup = this.pickups.create(x, y, null);
                pickup.setOrigin(0.5);
                pickup.setSize(tile.width, tile.height);
                pickup.setVisible(false);
                pickup.setData('tileIndex', tile.index);
            }
        });

        this.physics.add.overlap(this.player, this.pickups, (player, pickup) => {
            console.log(`Picked up tile ${pickup.getData('tileIndex')} at (${pickup.x}, ${pickup.y})`);
            const tileIndex = pickup.getData('tileIndex');

            if(tileIndex === 97) {
                this.keyCollected = true;
                console.log(`Key Collected`);
            }
            pickup.destroy();

            const tileX = this.map.worldToTileX(pickup.x);
            const tileY = this.map.worldToTileY(pickup.y);
            this.map.removeTileAt(tileX, tileY, false, false, 'Items');
        });

        this.itemlayer.forEachTile(tile => {
            if (tile.index !== -1) {
                this.add.rectangle(tile.getCenterX(), tile.getCenterY(), tile.width, tile.height, 0x00ff00, 0.3);
            }
        });

        // door unlock
        this.physics.add.collider(this.player, this.doorlayer, (player, tile) => {
            if (tile.index === 58) { // make sure this is the correct tile index for your door
                if (this.keyCollected) {
                    console.log('Door unlocked!');

                    this.time.delayedCall(1000, () => {
                        
                    });
                } else {
                    console.log('The door is locked.');
                }
            }
        });
    }

    update(time) {
        let dt = (time - this.last_time)/1000;
        this.last_time = time;
        this.player.update(dt);
    }
}