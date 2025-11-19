import { Player } from '../gameobjects/Player.js';
import { MovingPlatform } from '../gameobjects/MovingPlatforms.js';

export class Level_two extends Phaser.Scene {

    constructor() {
        super('Level_two');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
        this.load.image('MPlatforms', 'assets/MovingPlatform.png');
        this.load.spritesheet('player', 'assets/froggy-green.png', {frameWidth: 16, frameHeight: 17});
        this.load.spritesheet('vapor', 'assets/vapor_cloud.png', {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet('confetti', 'assets/confetti_spritesheet_0.png', {frameWidth: 40, frameHeight: 40});
        this.load.image('monochrome_tilemap', 'assets/kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap.png');
        this.load.tilemapTiledJSON('map', 'assets/Bare_bones.tmj');
        this.load.tilemapTiledJSON('Level_2_map', 'assets/LevelTwo.tmj');
        this.load.audio('unlock_gate', 'sounds/kenney_rpg-audio/Audio/metalLatch.ogg');
        this.load.audio('dead_s', 'sounds/vsgame_0/death.wav');
        this.load.audio('lvl_win', 'sounds/vsgame_0/round_end.wav');
        this.load.audio('Key_sound', 'sounds/kenney_rpg-audio/Audio/handleCoins.ogg');
        this.load.audio('djump','sounds/kenney_rpg-audio/Audio/cloth2.ogg');
        this.load.audio('dash', 'sounds/kenney_rpg-audio/Audio/dropLeather.ogg')
        this.load.audio('music3', 'sounds/uplift-atmospheric-jungle-dnb-electronic-loopable-edit-435842.mp3');
    }

    create() {
        this.last_time = 0;
        this.physics.world.TILE_BIAS = 58;

        this.sound.play('music3', {
            loop:true,
            volume:0.5
        });

        this.one = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.two = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);

        this.map = this.make.tilemap({ key: 'Level_2_map', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('monochrome_tilemap');

        this.unlockSound = this.sound.add('unlock_gate');
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
        this.gatelayer = this.map.createLayer("Gate", this.tileset, 0, 0);
        this.buttonlayer = this.map.createLayer("Button", this.tileset, 0, 0);
        this.objlayer = this.map.getObjectLayer("Objects");
        
        // Collision
        //this.platlayer.setCollisionBetween(1,1767);
        this.wallayer.setCollisionBetween(1,1767);
        this.gatelayer.setCollisionBetween(1,1767);
        //this.doorlayer.setCollision(58);

        this.exit = this.physics.add.staticGroup();
        this.pickups = this.physics.add.staticGroup();
        this.platforms = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();
        this.buttons = this.physics.add.staticGroup();

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
                case "Button":
                    const butt = this.buttons.create(x + (width * 0.5), y + (height * 0.5), null);
                    butt.setOrigin(0.5);
                    butt.setSize(width, height);
                    butt.setVisible(false);
                    break;
                default:
                    console.log("Unknown object: " + name);
            }
        });

        // moving platforms
        this.mplatforms = this.add.group();
        const platformObjects = this.map.getObjectLayer("Moving Platforms").objects;
        platformObjects.forEach(obj => {
            const props = {};
            obj.properties?.forEach(p => props[p.name] = p.value);
            const plat = new MovingPlatform(this, obj.x, obj.y - obj.height, 'MPlatforms', props);
            this.mplatforms.add(plat);
            this.physics.add.collider(plat, this.wallayer, (platform, wall) => {
                platform.reverseDirection = true; 
            }, null, this);
        });

        // Create a player
        this.player = new Player(this, this.spawnpoint[0], this.spawnpoint[1], 'player', 1);
        this.player.setDepth(2);
        this.physics.add.collider(this.platlayer, this.player);
        this.physics.add.collider(this.wallayer, this.player);
        this.gateCollider = this.physics.add.collider(this.gatelayer, this.player);

        this.keyCollected = false;
        this.gateOpened = false;
        this.canPlayUnlockSound = true;


        // TODO: fix player velocity on platform
        this.physics.add.collider(this.player, this.mplatforms, (player, mplatform) => {
            if (player.body.touching.down && mplatform.body.touching.up) {
                player.onPlatform = mplatform;
            }
            }, null, this);

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
            player.damage();
            this.keyCollected = false;
            this.pickups.children.iterate(pickup => {
                if (!pickup) return;
                pickup.body.enable = true;
            });

            this.buttons.children.iterate(butt => {
                if (!butt) return;
                butt.body.enable = true;
                const tileX = this.map.worldToTileX(butt.x);
                const tileY = this.map.worldToTileY(butt.y);
                this.buttonlayer.putTileAt(9, tileX, tileY);
            });

            this.itemlayer.setVisible(true);
            this.gateOpened = false;
            this.gatelayer.setVisible(true);
            this.gateCollider.overlapOnly = false;
        });

        //Platforms
        this.physics.add.collider(this.player,this.platforms);

        //Overlaps seem to have a bit of lag when interacting with them
        //Pickup Interactions
        this.physics.add.overlap(this.player, this.pickups, (player, pickup) => {
            console.log(`Picked up tile ${pickup.getData('type')} at (${pickup.x}, ${pickup.y})`);
            const type = pickup.getData('type');

            if(type === "Key") {
                this.KeySound.play({volume: 0.8});
                this.keyCollected = true;
                this.itemlayer.setVisible(false);
            };

            //this works weirdly if there are multiple items in a level, but is fine for this
            pickup.body.enable = false;
        });

        // door unlock
        this.physics.add.overlap(this.player, this.exit, (player, exit) => {
            if (this.keyCollected) {
                if (!exit.opened) {
                    exit.opened = true;
                    this.sound.stopAll();
                    this.lvl_OverSound.play({volume: 0.45});
                    player.body.enable = false;
                    console.log('Door unlocked!');
                    this.cameras.main.fadeOut(1000, 0, 0, 0);

                    // Delay scene transition by 1 second
                    this.time.delayedCall(1000, () => {
                        console.log("Go to next level or ending or something");
                    });
                }
            } else {
                console.log('The door is locked.');
            }
        });

        // button press
        this.physics.add.overlap(this.player, this.buttons, (player, button) => {
            if (!this.gateOpened) {
                this.gateOpened = true
                this.unlockSound.play({ volume: 1.0 });
            }
            this.gatelayer.setVisible(false);
            this.gateCollider.overlapOnly = true;
            const tileX = this.map.worldToTileX(button.x);
            const tileY = this.map.worldToTileY(button.y);
            this.buttonlayer.putTileAt(69, tileX, tileY);
        });
    }

    update(time) {
        let dt = (time - this.last_time)/1000;
        this.last_time = time;

        this.mplatforms.children.iterate(p => p.update(dt));

        if (this.player.onPlatform) {
            const plat = this.player.onPlatform;
            this.player.setVelocityX(plat.vx);// = plat.vx;
            //this.player.setVelocityY(plat.vy);;
        }
        if (!this.player.body.blocked.down && !this.player.body.touching.down) {
            this.player.onPlatform = null;
        }
        this.player.update(dt);

        if(this.one.isDown) {
            this.sound.stopAll();
            this.scene.stop("Level_two");
            this.scene.start('Start'); 
        }

        if(this.two.isDown) {
            this.sound.stopAll();
            this.scene.stop("Level_two");
            this.scene.start('Level_one'); 
        }
    }
}