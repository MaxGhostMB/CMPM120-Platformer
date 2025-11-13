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
        this.objlayer = this.map.getObjectLayer("Objects");
        
        // Collision
        this.platlayer.setCollisionBetween(1,1767);
        this.wallayer.setCollisionBetween(1,1767);
        //this.doorlayer.setCollision(58);

        this.exit = this.physics.add.staticGroup();
        this.pickups = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();

        this.spawnpoint = [0,0];

        this.objlayer.objects.forEach(objData => {
            const {x = 0, y = 0, name, width = 0, height = 0} = objData;
            switch(name) {
                case "Exit":
                    const exi = this.exit.create(x + (width * 0.5), y + (height * 0.5), null);
                    exi.setOrigin(0.5);
                    exi.setSize(width, height);
                    exi.setVisible(false);
                case "Key":
                    const pickup = this.pickups.create(x + (width * 0.5), y + (height * 0.5), null);
                    pickup.setOrigin(0.5);
                    pickup.setSize(width, height);
                    pickup.setVisible(false);
                    pickup.setData('type', name);
                    break;
                case "Spawn":
                    this.spawnpoint = [x + 8,y + 8];
                    break;
                case "Spikes":
                    const rect = this.spikes.create(x + (width * 0.5), y + (height * 0.5), null);
                    rect.setOrigin(0.5);
                    rect.setSize(width, height);
                    rect.setVisible(false);
                    break;
                default:
                    console.log("Unknown object: " + name);
            }
        });

        // Create a player
        this.player = new Player(this, this.spawnpoint[0], this.spawnpoint[1], 'player', 1);
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

        //Spike collision
        this.physics.add.overlap(this.player, this.spikes, (player, spikes) => {
            console.log(`Player hit spikes ouchie`);
        });

        //Overlaps seem to have a bit of lag when interacting with them
        //Pickup Interactions
        this.physics.add.overlap(this.player, this.pickups, (player, pickup) => {
            console.log(`Picked up tile ${pickup.getData('type')} at (${pickup.x}, ${pickup.y})`);
            const type = pickup.getData('type');

            if(type === "Key") {
                this.keyCollected = true;
                console.log(`Key Collected`);
            }
            pickup.destroy();

            const tileX = this.map.worldToTileX(pickup.x);
            const tileY = this.map.worldToTileY(pickup.y);
            //this creates a small lagspike for some reason
            this.map.removeTileAt(tileX, tileY, false, false, 'Items');
        });

        // door unlock
        this.physics.add.overlap(this.player, this.exit, (player, exit) => {
            if (this.keyCollected) {
                console.log('Door unlocked!');
                //this.cameras.main.fadeOut(1000, 0, 0, 0);

                // Delay scene transition by 1 second
                this.time.delayedCall(1000, () => {
                    console.log("Go to next level or ending or something");
                });
                
            } else {
                console.log('The door is locked.');
            }
        });
    }

    update(time) {
        let dt = (time - this.last_time)/1000;
        this.last_time = time;
        this.player.update(dt);
    }
}