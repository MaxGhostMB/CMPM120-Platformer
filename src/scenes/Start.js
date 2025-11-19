import { Player } from '../gameobjects/Player.js';
import { Level_one } from '../scenes/Level_one.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
        this.load.spritesheet('player', 'assets/froggy-green.png', {frameWidth: 16, frameHeight: 17});
        this.load.spritesheet('vapor', 'assets/vapor_cloud.png', {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet('confetti', 'assets/confetti_spritesheet_0.png', {frameWidth: 40, frameHeight: 40});
        this.load.image('monochrome_tilemap', 'assets/kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap.png');
        this.load.tilemapTiledJSON('map', 'assets/Bare_bones.tmj');
        this.load.tilemapTiledJSON('tutorial_map', 'assets/Tutorial.tmj');
        this.load.audio('dead_s', 'sounds/vsgame_0/death.wav');
        this.load.audio('lvl_win', 'sounds/vsgame_0/round_end.wav');
        this.load.audio('Key_sound', 'sounds/kenney_rpg-audio/Audio/handleCoins.ogg');
        this.load.audio('jump','sounds/kenney_rpg-audio/Audio/footstep05.ogg');
        this.load.audio('wjump','sounds/kenney_rpg-audio/Audio/handleSmallLeather.ogg');
        this.load.audio('djump','sounds/kenney_rpg-audio/Audio/cloth2.ogg');
        this.load.audio('dash', 'sounds/kenney_rpg-audio/Audio/dropLeather.ogg')
        this.load.audio('music', 'sounds/chill-relaxed-breakbeat-dnb-loop-edit-373484.mp3');
    }

    create() {
        this.last_time = 0;
        this.physics.world.TILE_BIAS = 32;

        this.two = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.three = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

        this.sound.play('music', {
            loop:true,
            volume:0.5
        });

        this.map = this.make.tilemap({ key: 'tutorial_map', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('monochrome_tilemap');

        this.KeySound = this.sound.add('Key_sound');
        this.lvl_OverSound = this.sound.add('lvl_win');

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
        //this.platlayer.setCollisionBetween(1,1767);
        this.wallayer.setCollisionBetween(1,1767);
        //this.doorlayer.setCollision(58);

        this.exit = this.physics.add.staticGroup();
        this.pickups = this.physics.add.staticGroup();
        this.platforms = this.physics.add.staticGroup();
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
                case "Platform":
                    const plat = this.platforms.create(x + (width * 0.5), y + (height * 0.5), null);
                    plat.setOrigin(0.5);
                    plat.setSize(width, height);
                    plat.setVisible(false);
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
        this.player.spawnpoint = this.spawnpoint;
        this.physics.add.collider(this.platlayer, this.player);
        this.physics.add.collider(this.wallayer, this.player);
        this.keyCollected = false;

        // Camera follows player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.15, 0.15);
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
            player.damage();
            if(this.keyCollected) {
                this.keyCollected = false;
                this.KeySound.play({volume: 0.8});
                // makes all pickups pick-up-able
                this.pickups.children.iterate(pickup => {
                    if (!pickup) return;
                    pickup.body.enable = true;
                });
                this.itemlayer.setVisible(true);
            }
        });

        //Platforms
        this.physics.add.collider(this.player,this.platforms);

        //Overlaps seem to have a bit of lag when interacting with them
        //Pickup Interactions
        this.physics.add.overlap(this.player, this.pickups, (player, pickup) => {
            console.log(`Picked up tile ${pickup.getData('type')} at (${pickup.x}, ${pickup.y})`);
            const type = pickup.getData('type');

            if(type === "Key") {
                this.keyCollected = true;  
                this.KeySound.play({volume: 0.8});
            }

            // avoiding picking up multiple times
            pickup.body.enable = false;
            //this works weirdly if there are multiple items in a level, but is fine for this
            this.itemlayer.setVisible(false);

            //const tileX = this.map.worldToTileX(pickup.x);
            //const tileY = this.map.worldToTileY(pickup.y);
            //this creates a small lagspike for some reason
            //this.map.removeTileAt(tileX, tileY, false, false, 'Items');
        });

        // door unlock
        this.physics.add.overlap(this.player, this.exit, (player, exit) => {
            if (this.keyCollected) {
                console.log('Door unlocked!');
                player.body.enable = false;
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.sound.stopAll();
                this.lvl_OverSound.play({volume: 0.45});

                // Delay scene transition by 1 second
                this.time.delayedCall(1000, () => {
                    this.scene.stop("Start");
                    this.scene.start('Level_one'); 
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

        if(this.two.isDown) {
            this.sound.stopAll();
            this.scene.stop("Start");
            this.scene.start('Level_one'); 
        }

        if(this.three.isDown) {
            this.sound.stopAll();
            this.scene.stop("Start");
            this.scene.start('Level_two'); 
        }
    }
}
